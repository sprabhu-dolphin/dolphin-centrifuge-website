// WebMCP tools for used / reconditioned Alfa Laval buyers.
// find_used_alfa_laval_centrifuges is read-only and registered sitewide.
// request_used_alfa_laval_quote registers only on the page that carries the
// quote form, and sends through the same Turnstile-gated path as its button.
import { selectCentrifugeCandidates } from '../lib/centrifugeSelection.mjs';
import { PREFERRED_CONTACT, WEBMCP_QUOTE_TOOL } from '../lib/usedQuote.mjs';
import { fillVisibleForm, submitUsedQuote, usedQuoteForm } from './usedQuoteForm';

type JsonObject = Record<string, any>;
type Context = { signal?: AbortSignal };
type Deps = {
  getCatalog: (signal?: AbortSignal) => Promise<JsonObject>;
  fetchJson: (url: string, signal?: AbortSignal) => Promise<JsonObject>;
};

const OFFER_URL = '/technical-data/used-alfa-laval-centrifuges.v1.json';
const OFFER_SCHEMA = 'dolphin-used-alfa-laval-offer-v1';
const APPLICATIONS = ['waste-oil', 'used-oil', 'diesel', 'fuel-oil', 'wvo-uco', 'lube-oil', 'hydraulic-oil', 'biodiesel',
  'machine-coolant', 'wastewater', 'crude-oil', 'beer-wine', 'food'];
const FAMILIES = ['whpx', 'mopx', 'mapx', 'mab', 'wspx', 'nx', 'food'];
const PAGE_SIZE = 3;

let offerCache: JsonObject | undefined;

async function getOffer(deps: Deps, signal?: AbortSignal): Promise<JsonObject> {
  if (offerCache) return offerCache;
  const offer = await deps.fetchJson(OFFER_URL, signal);
  if (offer.schemaVersion !== OFFER_SCHEMA || !Array.isArray(offer.families)) throw new Error('DOLPHIN_USED_OFFER_INVALID');
  offerCache = offer;
  return offer;
}

function result(status: string, data: JsonObject | null, warnings: string[], extra: JsonObject = {}): JsonObject {
  return {
    schemaVersion: OFFER_SCHEMA,
    status,
    data,
    answerability: { canStateAsFact: status === 'ok', qualificationRequired: true, missingInputs: [] },
    warnings,
    sources: status === 'ok' ? [OFFER_URL] : [],
    ...extra,
  };
}

async function findUsed(input: JsonObject, context: Context | undefined, deps: Deps): Promise<JsonObject> {
  const signal = context?.signal;
  const sizing = input.requiredFlow !== undefined;
  if (sizing && (!input.flowUnit || !input.fluid)) {
    return result('invalid_input', null, ['Flow sizing needs fluid, requiredFlow and flowUnit together.']);
  }
  let offer: JsonObject;
  try {
    offer = await getOffer(deps, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    return result('unavailable', null, ['The same-origin used Alfa Laval offer record is temporarily unavailable. Call (248) 522-2573.']);
  }

  const application = input.application ? offer.applications.find((a: JsonObject) => a.key === input.application) : undefined;
  const cleaning = input.cleaning && input.cleaning !== 'any' ? input.cleaning : undefined;
  const families = offer.families.filter((family: JsonObject) =>
    (!input.family || family.key === input.family) &&
    (!application || application.families.includes(family.key)) &&
    (!cleaning || family.cleaning === cleaning));
  const offset = input.offset ?? 0;
  if (offset > 0 && offset >= families.length) return result('invalid_input', null, ['Offset is outside the results. Retry with offset 0.']);

  let flowSizing: JsonObject | undefined;
  if (sizing) {
    try {
      const catalog = await deps.getCatalog(signal);
      flowSizing = selectCentrifugeCandidates(catalog, {
        application: input.fluid, requiredFlow: input.requiredFlow, flowUnit: input.flowUnit,
        ...(cleaning ? { cleaning } : {}),
      });
      const modelId = flowSizing.candidate?.modelId;
      if (modelId) {
        flowSizing.candidate.reconditionedFamily =
          offer.families.find((family: JsonObject) => family.models.some((m: JsonObject) => m.id === modelId))?.key ?? null;
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      flowSizing = { status: 'unavailable', message: 'Technical catalog temporarily unavailable; flow sizing skipped.' };
    }
  }

  return result('ok', {
    seller: { name: offer.seller.name, telephone: offer.seller.telephone, url: offer.seller.url, independence: offer.seller.independence },
    condition: { offered: offer.condition.offered, notOffered: offer.condition.notOffered, standard: offer.condition.sources[0] },
    warranty: offer.warranty.summary,
    inventory: `${offer.inventory.statement} ${offer.inventory.howToConfirm}`,
    priceGuidance: { basis: offer.priceGuidance.basis, anchors: offer.priceGuidance.anchors.map((a: JsonObject) => `${a.item}: ${a.from}`) },
    families: families.slice(offset, offset + PAGE_SIZE).map((family: JsonObject) => ({
      key: family.key, name: family.name, type: family.type, role: family.role,
      models: family.models.map((m: JsonObject) => ({ id: m.id, name: m.name, page: m.page })),
    })),
    ...(application ? { application: { key: application.key, label: application.label, page: application.page } } : {}),
    ...(flowSizing ? { flowSizing } : {}),
    quote: { page: offer.quoteRequest.page, tool: WEBMCP_QUOTE_TOOL, phone: offer.quoteRequest.phone },
  }, [
    'Per-model stock counts and exact prices are not published; availability and price are confirmed per quote.',
    'Use get_centrifuge_specifications or get_centrifuge_capacity with a model id for technical values.',
  ], { page: { offset, total: families.length, nextOffset: offset + PAGE_SIZE < families.length ? offset + PAGE_SIZE : null } });
}

export function usedEquipmentWebMcpTools(deps: Deps) {
  const tools: JsonObject[] = [{
    name: 'find_used_alfa_laval_centrifuges',
    title: 'Find used Alfa Laval centrifuges',
    description: 'List the used (remanufactured) Alfa Laval centrifuge families Dolphin Centrifuge sells, filtered by application, family or cleaning type, with model pages, reconditioning standard, warranty, inventory statement and published price anchors. Add fluid, requiredFlow and flowUnit for a documented OEM flow shortlist. Three families per page.',
    inputSchema: {
      type: 'object', additionalProperties: false, properties: {
        offset: { type: 'integer', minimum: 0, description: 'Result offset; use page.nextOffset for more families. Defaults to 0.' },
        application: { type: 'string', enum: APPLICATIONS, description: 'Application with a Dolphin page, such as waste-oil, diesel or wvo-uco.' },
        family: { type: 'string', enum: FAMILIES, description: 'Alfa Laval family key, such as whpx, mopx or mab.' },
        cleaning: { type: 'string', enum: ['any', 'manual', 'self-cleaning'], description: 'Solids discharge preference. Defaults to any.' },
        fluid: { type: 'string', minLength: 1, maxLength: 200, description: 'Exact documented fluid for flow sizing, such as diesel or marine diesel.' },
        requiredFlow: { type: 'number', exclusiveMinimum: 0, description: 'Required flow for sizing, in flowUnit.' },
        flowUnit: { type: 'string', enum: ['US GPM', 'L/h'], description: 'US gallons per minute or liters per hour.' },
      },
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false },
    execute: (input: JsonObject, context?: Context) => findUsed(input, context, deps),
  }];

  const form = usedQuoteForm();
  if (form) {
    const field = (description: string, maxLength = 254, required = true) =>
      ({ type: 'string', maxLength, ...(required ? { minLength: 1 } : {}), description });
    tools.push({
      name: WEBMCP_QUOTE_TOOL,
      title: 'Request a used Alfa Laval centrifuge quote',
      description: "Send the visitor's quote request for a used (remanufactured) Alfa Laval centrifuge to Dolphin Centrifuge engineers. Call only after the visitor asks to send it and approves sharing these contact details. Needs the page's security verification; if it is not complete, the visible form is filled and verification_required is returned for the visitor to finish. Creates a request for engineering follow-up, not an order.",
      inputSchema: {
        type: 'object', additionalProperties: false, required: ['name', 'company', 'email', 'phone', 'fluid'], properties: {
          name: field("Visitor's full name."),
          company: field('Company name.'),
          email: field('Business email for the reply.'),
          phone: field('Phone number with country code if outside the US.'),
          fluid: field('Fluid to process, such as waste oil, diesel or used cooking oil.'),
          flowRate: field('Required flow with units, such as 20 US GPM or 10,000 gallons/day.', 254, false),
          country: field('Country where the machine will be installed.', 100, false),
          preferredContact: { type: 'string', enum: PREFERRED_CONTACT, description: 'email, phone_dolphin_calls (Dolphin calls), or phone_you_call (visitor calls).' },
          modelInterest: field('Alfa Laval model or family of interest, if any.', 200, false),
          details: field('Other facts: solids, water content, temperature, hours per day, timeline.', 2000, false),
        },
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: true },
      execute: async (input: JsonObject, context?: Context) => {
        context?.signal?.throwIfAborted();
        fillVisibleForm(form, input);
        return submitUsedQuote(form, input, 'webmcp');
      },
    });
  }
  return tools;
}
