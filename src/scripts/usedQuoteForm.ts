// Submission path for the short quote form on the used Alfa Laval page. The
// visitor's Submit button and the WebMCP quote tool both call submitUsedQuote,
// so both need the same Turnstile token and reach the same Worker endpoint.
import {
  AGENT_CHANNEL,
  USED_QUOTE_ATTRIBUTION_NAME,
  USED_QUOTE_FORM_ID,
  buildUsedQuoteFields,
  usedQuoteLeadDetail,
  validateUsedQuote,
  withAgentAttribution,
} from '../lib/usedQuote.mjs';

export type UsedQuoteInput = Record<string, string | undefined>;
export type UsedQuoteResult = { status: string; submitted: boolean; message: string };

const VISIBLE_FIELDS = ['name', 'company', 'email', 'phone', 'fluid', 'flowRate'] as const;
const browser = globalThis as any;

export function usedQuoteForm(): HTMLFormElement | null {
  return (document.getElementById?.(USED_QUOTE_FORM_ID) as HTMLFormElement | null) ?? null;
}

function control(form: HTMLFormElement, name: string) {
  return form.querySelector<HTMLInputElement>(`[name="${name}"]`);
}

function showMessage(form: HTMLFormElement, kind: 'error' | 'success', message: string) {
  const error = form.querySelector<HTMLElement>('[data-quote-error]');
  const success = form.querySelector<HTMLElement>('[data-quote-success]');
  if (error) {
    error.textContent = kind === 'error' ? message : '';
    error.hidden = kind !== 'error';
  }
  if (success) {
    success.textContent = kind === 'success' ? message : '';
    success.hidden = kind !== 'success';
  }
  (kind === 'error' ? error : success)?.scrollIntoView?.({ block: 'center' });
}

export function readVisibleInput(form: HTMLFormElement): UsedQuoteInput {
  return Object.fromEntries(VISIBLE_FIELDS.map((name) => [name, control(form, name)?.value ?? '']));
}

/** Copy supplied values into the visible inputs so the visitor sees what is sent. */
export function fillVisibleForm(form: HTMLFormElement, input: UsedQuoteInput) {
  for (const name of VISIBLE_FIELDS) {
    const field = control(form, name);
    if (!field || typeof input[name] !== 'string') continue;
    field.value = input[name] as string;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export async function submitUsedQuote(
  form: HTMLFormElement,
  input: UsedQuoteInput,
  channel: 'form' | typeof AGENT_CHANNEL,
): Promise<UsedQuoteResult> {
  if (form.dataset.pending === 'true') {
    return { status: 'pending', submitted: false, message: 'A quote request from this page is already being sent.' };
  }
  const invalid = validateUsedQuote(input);
  if (invalid) {
    showMessage(form, 'error', invalid);
    return { status: 'invalid_input', submitted: false, message: invalid };
  }
  const token = control(form, 'cf-turnstile-response')?.value ?? '';
  if (!token) {
    const message = 'Complete the security verification in the quote form, then send again.';
    showMessage(form, 'error', message);
    form.querySelector('.dolphin-turnstile')?.scrollIntoView?.({ block: 'center' });
    return { status: 'verification_required', submitted: false, message };
  }

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  form.dataset.pending = 'true';
  if (button) button.disabled = true;
  try {
    browser.dolphinAttribution?.markFormSubmit?.(USED_QUOTE_ATTRIBUTION_NAME);
    const payload = new FormData();
    payload.append('bot-field', control(form, 'bot-field')?.value ?? '');
    for (const [key, value] of buildUsedQuoteFields(input, { channel, pagePath: location.pathname })) payload.append(key, value);
    payload.append('cf-turnstile-response', token);
    const attribution = typeof browser.dolphinGetAttributionForForm === 'function'
      ? browser.dolphinGetAttributionForForm(USED_QUOTE_ATTRIBUTION_NAME)
      : JSON.stringify({ form_name: USED_QUOTE_ATTRIBUTION_NAME });
    payload.append('dolphin_attribution', channel === AGENT_CHANNEL ? withAgentAttribution(attribution) : attribution);

    const response = await fetch(form.dataset.endpoint as string, { method: 'POST', body: payload });
    let result: any = {};
    try { result = await response.json(); } catch {}
    if (!response.ok || !result.success) {
      const message = result.error || 'The request could not be confirmed. Please call (248) 522-2573.';
      showMessage(form, 'error', message);
      return { status: 'unconfirmed', submitted: false, message };
    }
    browser.dispatchEvent?.(new CustomEvent('dolphin:generate-lead', { detail: usedQuoteLeadDetail(input, channel) }));
    form.reset();
    const message = 'Received. An engineer will reply within one business day. This is a quote request, not an order.';
    showMessage(form, 'success', message);
    return { status: 'submitted', submitted: true, message };
  } catch {
    const message = 'Network error. Please call (248) 522-2573 or email sales@dolphincentrifuge.com.';
    showMessage(form, 'error', message);
    return { status: 'unconfirmed', submitted: false, message };
  } finally {
    delete form.dataset.pending;
    if (button) button.disabled = false;
    const widget = form.querySelector<HTMLElement>('.dolphin-turnstile');
    if (browser.turnstile && widget?.dataset.widgetId) browser.turnstile.reset(widget.dataset.widgetId);
  }
}

export function initUsedQuoteForm() {
  const form = usedQuoteForm();
  if (!form || form.dataset.ready === 'true') return;
  form.dataset.ready = 'true';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitUsedQuote(form, readVisibleInput(form), 'form');
  });
}
