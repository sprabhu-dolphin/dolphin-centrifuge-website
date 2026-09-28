import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { technicalCatalog } from './src/data/agentCatalog.mjs';
import { FORM_TYPES } from './lead-reconciliation-core.mjs';
import {
  USED_PAGE_PATH,
  buildUsedOfferRecord,
  usedApplications,
  usedFamilies,
} from './src/data/usedAlfaLavalOffer.mjs';
import {
  NOT_ASKED,
  USED_QUOTE_GA4_LEAD_FORM,
  buildUsedQuoteFields,
  normalizeCountry,
  splitName,
  usedQuoteLeadDetail,
  validateUsedQuote,
  withAgentAttribution,
} from './src/lib/usedQuote.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const exists = (target) => access(target).then(() => true, () => false);
const human = { name: 'Grace Hopper', company: 'Navy Fuel Co', email: 'grace@example.com', phone: '313-555-0101', fluid: 'Diesel', flowRate: '' };

test('every family model is a real catalog record and every linked page is a real route', async () => {
  const ids = new Set(technicalCatalog.models.map((model) => model.id));
  for (const family of usedFamilies) {
    assert.ok(family.models.length > 0, family.key);
    for (const model of family.models) {
      assert.ok(ids.has(model.id), model.id);
      const route = new URL(model.page).pathname.replace(/^\/|\/$/g, '');
      assert.ok(await exists(path.join(ROOT, 'src/pages', `${route}.astro`)) || await exists(path.join(ROOT, 'src/pages', route, 'index.astro')), model.page);
    }
  }
  const familyKeys = new Set(usedFamilies.map((family) => family.key));
  for (const application of usedApplications) {
    assert.ok(await exists(path.join(ROOT, 'src/pages', `${application.path.replace(/^\/|\/$/g, '')}.astro`)), application.path);
    for (const key of application.families) assert.ok(familyKeys.has(key), `${application.key} -> ${key}`);
  }
});

test('offer record states no per-model counts or exact prices', () => {
  const record = buildUsedOfferRecord();
  assert.equal(record.schemaVersion, 'dolphin-used-alfa-laval-offer-v1');
  assert.equal(record.page, `https://dolphincentrifuge.com${USED_PAGE_PATH}`);
  assert.equal(record.inventory.perModelCountsPublished, false);
  assert.match(record.priceGuidance.basis, /Quoted per unit/);
  assert.doesNotMatch(JSON.stringify(record), /—/, 'no em dashes in customer-facing copy');
});

test('short form sends explicit "Not asked" values, never guessed ones', () => {
  assert.equal(validateUsedQuote(human), undefined);
  assert.match(validateUsedQuote({ ...human, fluid: ' ' }), /fluid/);
  assert.match(validateUsedQuote({ ...human, email: 'nope' }), /valid email/);
  assert.match(validateUsedQuote({ ...human, preferredContact: 'fax' }), /preferredContact/);
  const fields = Object.fromEntries(buildUsedQuoteFields(human));
  assert.equal(fields.contact_method, NOT_ASKED);
  assert.equal(fields.country, NOT_ASKED);
  assert.equal(fields.centrifuge_condition, 'remanufactured_ok');
  assert.equal(fields.email_confirm, human.email);
  assert.doesNotMatch(fields.additional_details, /AI agent/);
  assert.deepEqual(splitName('Cher'), { first: 'Cher', last: 'Cher' });
  assert.deepEqual(normalizeCountry('United States'), { country: 'US', country_other: '' });
  assert.deepEqual(normalizeCountry('Germany'), { country: 'Other', country_other: 'Germany' });
});

test('agent attribution keeps the source and paid click mediums', () => {
  const organic = JSON.parse(withAgentAttribution(JSON.stringify({ source: 'google', medium: 'organic' })));
  assert.deepEqual([organic.source, organic.medium, organic.content, organic.pre_agent_medium], ['google', 'webmcp', 'webmcp', 'organic']);
  const paid = JSON.parse(withAgentAttribution(JSON.stringify({ source: 'google', medium: 'cpc', gclid: 'abc' })));
  assert.deepEqual([paid.medium, paid.content], ['cpc', 'webmcp']);
  const direct = JSON.parse(withAgentAttribution('not json'));
  assert.deepEqual([direct.source, direct.medium, direct.form_name], ['webmcp', 'webmcp', 'used_alfa_laval_quote_form']);
});

test('GA4 lead_form maps to the monitored contact form type', () => {
  const contact = FORM_TYPES.find((type) => type.d1 === 'contact');
  assert.equal(contact.ga4LeadForm, USED_QUOTE_GA4_LEAD_FORM);
  assert.equal(usedQuoteLeadDetail(human, 'form').lead_form, contact.ga4LeadForm);
});

test('the existing contact Worker accepts both payloads and stores the agent markers in D1', async (t) => {
  const worker = (await import('./workers/contact-form/index.js')).default;
  const realFetch = globalThis.fetch;
  const inserts = [];
  t.after(() => { globalThis.fetch = realFetch; });
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('turnstile')) {
      assert.equal(new URLSearchParams(init.body).get('response'), 'token');
      return Response.json({ success: true, hostname: 'dolphincentrifuge.com', action: 'contact' });
    }
    if (String(url).includes('resend.com')) return Response.json({ id: 'test' });
    throw new Error(`unexpected fetch ${url}`);
  };
  const DB = {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            all: async () => ({ results: [] }),
            first: async () => null,
            run: async () => { if (/INSERT INTO submissions/.test(sql)) inserts.push({ sql, values }); return { meta: {} }; },
          };
        },
      };
    },
  };
  const env = { DB, TURNSTILE_SECRET_KEY: 'secret', RESEND_API_KEY: 'key' };
  const ctx = { waitUntil() {} };
  const send = async (input, channel) => {
    const body = new FormData();
    for (const [key, value] of buildUsedQuoteFields(input, { channel })) body.append(key, value);
    body.append('cf-turnstile-response', 'token');
    const attribution = JSON.stringify({ form_name: 'used_alfa_laval_quote_form', source: 'chatgpt.com', medium: 'referral', landing_page: USED_PAGE_PATH, current_page: USED_PAGE_PATH });
    body.append('dolphin_attribution', channel === 'webmcp' ? withAgentAttribution(attribution) : attribution);
    const response = await worker.fetch(new Request('https://worker.test/', { method: 'POST', body }), env, ctx);
    return response.json();
  };

  assert.equal((await send(human, 'form')).success, true);
  assert.equal((await send({ ...human, country: 'Mexico', preferredContact: 'email' }, 'webmcp')).success, true);
  assert.equal(inserts.length, 2);

  const column = (insert, name) => {
    const columns = insert.sql.slice(insert.sql.indexOf('(') + 1, insert.sql.indexOf(') VALUES')).split(',').map((c) => c.trim());
    return insert.values[columns.indexOf(name)];
  };
  const [person, agent] = inserts;
  assert.equal(column(person, 'form_type'), 'contact');
  assert.equal(column(person, 'attribution_medium'), 'referral');
  assert.equal(column(person, 'attribution_landing_page'), USED_PAGE_PATH);
  assert.equal(column(person, 'country'), NOT_ASKED);
  assert.equal(column(agent, 'form_type'), 'contact');
  assert.equal(column(agent, 'attribution_source'), 'chatgpt.com');
  assert.equal(column(agent, 'attribution_medium'), 'webmcp');
  assert.equal(column(agent, 'attribution_content'), 'webmcp');
  assert.equal(column(agent, 'country'), 'MX');
  assert.match(column(agent, 'attribution_raw_json'), /"agent_tool":"request_used_alfa_laval_quote"/);
  assert.match(column(agent, 'additional_details'), /WebMCP quote tool/);
});

test('built page renders one H1, matching FAQ schema, the quote form and crawlable data', async (t) => {
  const pagePath = path.join(ROOT, 'dist', USED_PAGE_PATH, 'index.html');
  if (!(await exists(pagePath))) {
    t.skip('dist does not exist; run npm run build first');
    return;
  }
  const html = await readFile(pagePath, 'utf8');
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(html, /<link rel="canonical" href="https:\/\/dolphincentrifuge\.com\/used-alfa-laval-centrifuges-for-sale\/"/);
  assert.match(html, /id="used-alfa-laval-quote-form"/);
  assert.match(html, /data-action="contact"/);
  assert.match(html, /href="tel:\+12485222573"/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .flatMap((match) => [JSON.parse(match[1])].flat())
    .flatMap((node) => node['@graph'] ?? [node]);
  const faq = schemas.find((node) => node['@type'] === 'FAQPage');
  assert.ok(faq, 'FAQPage schema');
  for (const question of faq.mainEntity) assert.ok(html.includes(question.name.replace(/'/g, '&#39;')) || html.includes(question.name), question.name);
  assert.ok(schemas.some((node) => node['@type'] === 'ItemList'));
  const record = JSON.parse(await readFile(path.join(ROOT, 'dist/technical-data/used-alfa-laval-centrifuges.v1.json'), 'utf8'));
  assert.deepEqual(record, JSON.parse(JSON.stringify(buildUsedOfferRecord())));
  const sitemap = await readFile(path.join(ROOT, 'dist/sitemap-0.xml'), 'utf8');
  assert.ok(sitemap.includes('https://dolphincentrifuge.com/used-alfa-laval-centrifuges-for-sale/'));
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const main = text.slice(text.indexOf('id="answer"'), text.indexOf('id="machine-readable"'));
  assert.doesNotMatch(main, /—/, 'no em dashes in page copy');
});
