// Pure payload rules for the short quote form on
// /used-alfa-laval-centrifuges-for-sale/. The visitor always sends the form with
// its own button. When the WebMCP prepare tool filled it first, the same payload
// carries the agent attribution markers below.
//
// The shared contact Worker requires more fields than this short form asks for.
// Fields the visitor was not asked are sent as an explicit "Not asked" value,
// never a guessed one. Submitting this form means a reconditioned machine is
// acceptable, so centrifuge_condition is remanufactured_ok.

export const USED_QUOTE_FORM_ID = 'used-alfa-laval-quote-form';
export const USED_QUOTE_ATTRIBUTION_NAME = 'used_alfa_laval_quote_form';
/** GA4 lead_form stays the contact form so the lead monitor maps it to D1 form_type 'contact'. */
export const USED_QUOTE_GA4_LEAD_FORM = 'centrifuge_contact_form';
export const USED_QUOTE_FORM_VARIANT = 'used_alfa_laval_quick_quote';
export const WEBMCP_QUOTE_TOOL = 'prepare_used_alfa_laval_quote';
/** Marker for agent-prepared leads: D1 attribution_content = 'webmcp' (always) and attribution_medium = 'webmcp' (unless an ad click ID is present). */
export const AGENT_CHANNEL = 'webmcp';
export const NOT_ASKED = 'Not asked (quick quote form)';
export const PREFERRED_CONTACT = ['email', 'phone_dolphin_calls', 'phone_you_call'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 254, company: 254, email: 254, phone: 254, fluid: 254, flowRate: 254, country: 100, modelInterest: 200, details: 2000 };
const PAID_CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'msclkid'];

const text = (value) => (typeof value === 'string' ? value.trim() : '');

export function splitName(fullName) {
  const parts = text(fullName).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

/** Map a free-text country to the Worker's US/CA/MX/Other codes. */
export function normalizeCountry(value) {
  const country = text(value);
  if (!country) return { country: NOT_ASKED, country_other: '' };
  const key = country.toLowerCase().replace(/[.\s]/g, '');
  if (['us', 'usa', 'unitedstates', 'unitedstatesofamerica'].includes(key)) return { country: 'US', country_other: '' };
  if (['ca', 'canada'].includes(key)) return { country: 'CA', country_other: '' };
  if (['mx', 'mexico', 'méxico'].includes(key)) return { country: 'MX', country_other: '' };
  return { country: 'Other', country_other: country };
}

/** Returns a user-facing problem, or undefined when the input can be sent. */
export function validateUsedQuote(input) {
  if (!input || typeof input !== 'object') return 'Enter your name, company, email, phone and fluid.';
  for (const [field, label] of [['name', 'name'], ['company', 'company'], ['email', 'email'], ['phone', 'phone'], ['fluid', 'fluid to be processed']]) {
    if (!text(input[field])) return `Please enter your ${label}.`;
  }
  for (const [field, max] of Object.entries(LIMITS)) {
    if (input[field] !== undefined && (typeof input[field] !== 'string' || input[field].length > max)) return `${field} is too long or not text.`;
  }
  if (!EMAIL_RE.test(text(input.email))) return 'Please enter a valid email address.';
  if (text(input.preferredContact) && !PREFERRED_CONTACT.includes(input.preferredContact)) return 'preferredContact must be email, phone_dolphin_calls or phone_you_call.';
}

/** Ordered Worker fields (without Turnstile token and attribution). */
export function buildUsedQuoteFields(input, { channel = 'form', pagePath = '/used-alfa-laval-centrifuges-for-sale/' } = {}) {
  const name = splitName(input.name);
  const email = text(input.email);
  const { country, country_other } = normalizeCountry(input.country);
  const details = [
    `Quote request from ${pagePath} (used and reconditioned Alfa Laval centrifuges).`,
    channel === AGENT_CHANNEL ? "Prepared by an AI agent with the page's WebMCP quote tool; the visitor reviewed and sent it." : '',
    text(input.modelInterest) ? `Model of interest: ${text(input.modelInterest)}` : '',
    text(input.details),
  ].filter(Boolean).join('\n');
  return [
    ['first_name', name.first],
    ['last_name', name.last],
    ['company', text(input.company)],
    ['email', email],
    ['email_confirm', email],
    ['phone', text(input.phone)],
    ['contact_method', input.preferredContact || NOT_ASKED],
    ['country', country],
    ['country_other', country_other],
    ['fluid_type', text(input.fluid)],
    ['required_flow_rate', text(input.flowRate)],
    ['centrifuge_condition', 'remanufactured_ok'],
    ['additional_details', details],
  ];
}

/**
 * Adds the agent-channel markers to the site attribution JSON. The original
 * source is kept; the original medium/content move to pre_agent_* fields.
 * Paid click IDs keep their medium so paid-lead reports stay correct.
 */
export function withAgentAttribution(rawJson) {
  let data = {};
  try {
    const parsed = JSON.parse(rawJson || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed;
  } catch {}
  const paidClick = PAID_CLICK_IDS.some((key) => text(data[key]));
  return JSON.stringify({
    ...data,
    form_name: USED_QUOTE_ATTRIBUTION_NAME,
    pre_agent_medium: data.medium || '',
    pre_agent_content: data.content || '',
    source: data.source || AGENT_CHANNEL,
    medium: paidClick ? data.medium : AGENT_CHANNEL,
    content: AGENT_CHANNEL,
    agent_channel: AGENT_CHANNEL,
    agent_tool: WEBMCP_QUOTE_TOOL,
  });
}

/** GA4 generate_lead detail, shared by both channels. */
export function usedQuoteLeadDetail(input, channel) {
  return {
    lead_form: USED_QUOTE_GA4_LEAD_FORM,
    lead_type: 'quote_request',
    form_variant: USED_QUOTE_FORM_VARIANT,
    lead_channel: channel,
    fluid_type: text(input.fluid) || undefined,
  };
}
