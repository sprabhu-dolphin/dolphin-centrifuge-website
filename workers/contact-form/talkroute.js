// Talkroute -> calls adapter. Turns a Talkroute webhook event (new_call_record /
// new_voicemail) or an API record (/v2/call-history, /v2/voice-messages) into the
// raw record shape that normalizeCallRecord() in index.js already understands.
// Talkroute webhook payloads carry no record id, so the idempotency key is built
// from the call time (to the second) and the caller's digits.

const RESULT_LABELS = { answered: 'Answered', missed: 'Missed', hangup: 'Hung up' };

function text(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}

function digitsOf(value) {
  let digits = text(value).replace(/\D+/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits;
}

export function talkrouteCallRaw(event) {
  if (!event || typeof event !== 'object') return null;

  const direction = text(event.direction).toLowerCase();
  if (direction && direction !== 'inbound') return null;

  const when = text(event.datetime || event.callDate || event.createdAt);
  const ms = Date.parse(when);
  if (!when || Number.isNaN(ms)) return null;

  const isVoicemail = !direction && (
    'transcription' in event || 'mailbox_name' in event || 'transcript' in event || 'callerNumber' in event
  );
  const caller = text(event.caller_number || event.externalNumber || event.callerNumber);
  const dialed = text(event.called_number || event.phoneNumber);
  const name = text(event.caller_cname || event.externalName || event.callerName);
  const result = text(event.call_result || event.result || event.callResult).toLowerCase();
  const transcript = text(event.transcription || event.transcript);
  const hadVoicemail = isVoicemail || Boolean(transcript)
    || (Array.isArray(event.events) && event.events.some((e) => e && e.type === 'voicemail'));

  const epoch = Math.floor(ms / 1000);
  const key = `tr-${isVoicemail ? 'vm' : 'call'}-${epoch}-${digitsOf(caller) || 'unknown'}`;
  const resultLabel = RESULT_LABELS[result] || result;

  return {
    source: 'talkroute_api',
    source_message_id: key,
    source_thread_id: text(event.id),
    created_at: new Date(ms).toISOString(),
    caller_raw: caller,
    email_from: name,
    email_to: dialed,
    email_subject: `Talkroute ${isVoicemail ? 'voicemail' : 'inbound call'} from ${name || caller || 'unknown caller'} to ${dialed || 'Talkroute'}${resultLabel ? ` (${resultLabel})` : ''}`,
    mailbox: hadVoicemail ? 'Voicemail' : resultLabel,
    duration_seconds: Number(event.duration) || 0,
    transcript,
  };
}
