// Dolphin Centrifuge remote MCP server (Streamable HTTP, stateless, JSON responses).
// Public URL: https://dolphincentrifuge.com/mcp, proxied by the Pages Function
// functions/mcp/[[path]].js to https://dolphin-mcp.dolphin-centrifuge.workers.dev/mcp.
// Read-only tools plus request_quote, which hands the request to the existing
// dolphin-contact-form Worker (service binding) so the lead follows the same
// D1 + sales notification path as the website form.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import {
  ATTRIBUTION, CONTACT, SERVER_INSTRUCTIONS, SITE,
  checkDolphinStock, getCentrifugeSpecs, listCentrifugeModels, sizeCentrifuge,
} from './catalog.js';

const VERSION = '1.0.0';
const ENDPOINT = `${SITE}/mcp`;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
  'Access-Control-Max-Age': '86400',
};
const BASE_HEADERS = { ...CORS, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' };

const json = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], ...(data?.error ? { isError: true } : {}) });
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

function buildServer(env, request) {
  const server = new McpServer(
    { name: 'dolphin-centrifuge', title: 'Dolphin Centrifuge', version: VERSION, websiteUrl: SITE },
    { instructions: SERVER_INSTRUCTIONS },
  );

  server.registerTool('get_centrifuge_specs', {
    title: 'Get centrifuge specs',
    description: 'Published specifications for an Alfa Laval disc stack or decanter centrifuge (or Dolphin DMPX/DMB module) remanufactured by Dolphin Centrifuge. Pass an exact model such as "MOPX 207" or a free-text query such as "diesel self-cleaning". Capacities always come with their fluid and conditions.',
    inputSchema: {
      model: z.string().max(80).optional().describe('Model designation, alias or Dolphin module, e.g. "MOPX 207", "WHPX 405", "DMPX-028", "NX 418".'),
      query: z.string().max(200).optional().describe('Free-text search when the exact model is unknown, e.g. "decanter 418" or "turbine oil".'),
    },
    annotations: READ_ONLY,
  }, async ({ model, query }) => json(getCentrifugeSpecs({ model, query })));

  server.registerTool('list_centrifuge_models', {
    title: 'List centrifuge models',
    description: 'List the centrifuge models Dolphin publishes specs for, one line each, optionally filtered by type and by application/fluid keyword.',
    inputSchema: {
      type: z.enum(['disc stack', 'decanter']).optional().describe('Machine type.'),
      application: z.string().max(200).optional().describe('Fluid or application keyword, e.g. "diesel", "lube oil", "coolant", "wastewater".'),
    },
    annotations: READ_ONLY,
  }, async (args) => json(listCentrifugeModels(args)));

  server.registerTool('check_dolphin_stock', {
    title: 'Check Dolphin stock',
    description: 'Dated list of Alfa Laval centrifuges in stock at Dolphin Centrifuge (Warren, Michigan): model, type, condition and whether the unit is in stock or built to order. No prices or serial numbers.',
    inputSchema: {
      model: z.string().max(80).optional().describe('Optional model or family filter, e.g. "MOPX 207" or "WHPX". Omit for the full list.'),
    },
    annotations: READ_ONLY,
  }, async (args) => json(checkDolphinStock(args)));

  server.registerTool('size_centrifuge', {
    title: 'RCF / RPM sizing',
    description: 'Relative centrifugal force (g-force) calculator using RCF = 1.118e-5 x r(cm) x RPM^2. Give any two of bowl_diameter_m, rpm, g_force and get the third plus basic separation guidance.',
    inputSchema: {
      bowl_diameter_m: z.number().positive().max(3).optional().describe('Bowl inside diameter in meters, e.g. 0.36.'),
      rpm: z.number().positive().max(30000).optional().describe('Bowl speed in revolutions per minute.'),
      g_force: z.number().positive().max(100000).optional().describe('Relative centrifugal force, x g.'),
    },
    annotations: READ_ONLY,
  }, async (args) => json(sizeCentrifuge(args)));

  server.registerTool('request_quote', {
    title: 'Request a quote from Dolphin',
    description: 'Send a quote or information request to Dolphin Centrifuge sales on behalf of the user. Only call with the user\'s explicit consent and their real name, company and email. Dolphin replies by email or phone within a few business days.',
    inputSchema: {
      name: z.string().min(2).max(120).describe('Requester full name.'),
      company: z.string().min(1).max(160).describe('Requester company.'),
      email: z.string().email().max(200).describe('Requester email; Dolphin replies here.'),
      phone: z.string().max(40).optional().describe('Requester phone, if they want a call.'),
      country: z.string().max(80).optional().describe('Requester country.'),
      model: z.string().max(80).optional().describe('Model of interest, e.g. "MOPX 207".'),
      application: z.string().max(200).optional().describe('Fluid / application, e.g. "diesel fuel polishing".'),
      flow_gpm: z.number().positive().max(100000).optional().describe('Required flow in US GPM.'),
      message: z.string().min(1).max(4000).describe('What the user needs: application details, solids, temperature, timeline.'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  }, async (args) => json(await submitQuote(args, env, request)));

  return server;
}

// The Pages proxy passes the visitor IP in x-dolphin-client-ip.
const clientIp = (request) => request.headers.get('x-dolphin-client-ip') || request.headers.get('CF-Connecting-IP') || '';

async function submitQuote(args, env, request) {
  const ip = clientIp(request) || 'unknown';
  if (env.QUOTE_LIMIT) {
    const { success } = await env.QUOTE_LIMIT.limit({ key: ip });
    if (!success) return { error: `Too many quote requests. Try again in a minute or call ${CONTACT.phone}.` };
  }
  if (!env.CONTACT || !env.MCP_SUBMIT_KEY) {
    return { error: `Quote submission is unavailable right now. Email ${CONTACT.email} or call ${CONTACT.phone}.` };
  }
  const parts = args.name.trim().split(/\s+/);
  const firstName = parts.shift();
  const lastName = parts.join(' ') || '(not given)';
  const now = new Date().toISOString();
  const details = [
    args.message.trim(),
    '',
    args.model ? `Model of interest: ${args.model}` : null,
    'Submitted through the Dolphin MCP server by an AI agent on behalf of the requester.',
  ].filter((l) => l !== null).join('\n');
  const fields = {
    first_name: firstName,
    last_name: lastName,
    company: args.company.trim(),
    email: args.email.trim(),
    email_confirm: args.email.trim(),
    phone: args.phone?.trim() || 'Not provided',
    contact_method: 'email',
    country: args.country?.trim() || 'Not provided',
    fluid_type: args.application?.trim() || (args.model ? `Not specified (model ${args.model})` : 'Not specified'),
    required_flow_rate: args.flow_gpm ? `${args.flow_gpm} US GPM` : '',
    centrifuge_condition: 'Not specified (AI agent request)',
    additional_details: details,
    dolphin_attribution: JSON.stringify({
      form_name: 'mcp_request_quote',
      source: 'mcp',
      medium: 'agent',
      campaign: 'mcp_server',
      landing_page: `${ENDPOINT}?utm_source=mcp&utm_medium=agent`,
      current_page: ENDPOINT,
      referrer: '',
      first_seen_at: now,
      form_submitted_at: now,
      page_count: 0,
    }),
  };
  const headers = new Headers({ 'Content-Type': 'application/json', 'X-Dolphin-MCP-Key': env.MCP_SUBMIT_KEY });
  for (const h of ['User-Agent', 'Accept-Language']) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (clientIp(request)) headers.set('CF-Connecting-IP', clientIp(request));
  let res, body;
  try {
    res = await env.CONTACT.fetch('https://dolphin-contact-form/', { method: 'POST', headers, body: JSON.stringify(fields) });
    body = await res.json();
  } catch (e) {
    return { error: `Quote submission failed. Email ${CONTACT.email} or call ${CONTACT.phone}.` };
  }
  if (!res.ok || !body?.success) {
    return { error: body?.error || `Quote submission failed. Email ${CONTACT.email} or call ${CONTACT.phone}.` };
  }
  return {
    submitted: true,
    submissionId: body.submission_id ?? null,
    confirmation: 'Dolphin Centrifuge sales received the request and will reply within a few business days.',
    replyTo: args.email,
    contact: CONTACT,
    attribution: ATTRIBUTION,
  };
}

function withHeaders(response, extra = {}) {
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries({ ...BASE_HEADERS, ...extra })) out.headers.set(k, v);
  return out;
}

const note = (status = 200) => new Response(JSON.stringify({
  name: 'Dolphin Centrifuge MCP server',
  note: 'Dolphin Centrifuge MCP server. For AI agents. Contact sales@dolphincentrifuge.com',
  endpoint: ENDPOINT,
  transport: 'streamable-http',
}, null, 2), { status, headers: { ...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path !== '/mcp' && path !== '/') {
      return new Response(JSON.stringify({ error: 'Not found', endpoint: ENDPOINT }), {
        status: 404, headers: { ...BASE_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: BASE_HEADERS });
    if (request.method === 'GET' || request.method === 'HEAD') {
      // Stateless server: no server-initiated SSE stream (spec: 405 for event-stream GETs).
      if ((request.headers.get('Accept') || '').includes('text/event-stream')) {
        return new Response(null, { status: 405, headers: { ...BASE_HEADERS, Allow: 'POST, OPTIONS' } });
      }
      return note();
    }
    if (request.method === 'DELETE') {
      return new Response(null, { status: 405, headers: { ...BASE_HEADERS, Allow: 'POST, OPTIONS' } });
    }
    if (request.method !== 'POST') return note(405);

    // Be lenient with clients that send only one of the two required Accept types.
    let req = request;
    const accept = request.headers.get('Accept') || '';
    if (!accept.includes('application/json') || !accept.includes('text/event-stream')) {
      const headers = new Headers(request.headers);
      headers.set('Accept', 'application/json, text/event-stream');
      req = new Request(request, { headers });
    }
    const server = buildServer(env, request);
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    try {
      return withHeaders(await transport.handleRequest(req));
    } catch (e) {
      return withHeaders(Response.json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error' }, id: null }, { status: 500 }));
    }
  },
};
