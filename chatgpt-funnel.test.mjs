import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import worker from './workers/contact-form/index.js';
import { CHATGPT_FUNNEL_SQL, chatgptFunnelWindow, summarizeChatgptFunnel, loadChatgptFunnel } from './workers/contact-form/chatgpt-funnel.mjs';
const window = { start: '2026-10-04T04:00:00.000Z', end_exclusive: '2026-10-11T04:00:00.000Z' };
function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE visitor_events(created_at TEXT, visitor_id TEXT, session_id TEXT, event_type TEXT, page_path TEXT, source TEXT, medium TEXT, attribution_json TEXT, visitor_context_json TEXT);
    CREATE TABLE submissions(created_at TEXT, attribution_visitor_id TEXT, attribution_session_id TEXT, attribution_raw_json TEXT, email TEXT, first_name TEXT, last_name TEXT)`);
  return db;
}

test('session funnel separates ad attribution, page reach and engagement without mixing organic or Google traffic', () => {
  const db = fixture();
  const insert = db.prepare("INSERT INTO visitor_events VALUES(?,?,?,?,?,?,?,?,'')");
  const add = (session, options = {}) => insert.run(options.at || '2026-10-06T12:00:00.000Z', 'private-fixture-id', session, options.event || 'pageview', options.path || '/waste-oil/', options.source || 'chatgpt', options.medium || 'paid', JSON.stringify({ content: options.tag ?? 'waste_oil_a' }));
  add('one'); add('one');
  add('one', { path: 'https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/?utm_source=chatgpt' });
  add('one', { event: 'form_start', source: 'direct', medium: 'none', tag: '' });
  add('two', { tag: 'parts_a', path: '/alfa-laval-centrifuge-parts/' });
  add('two', { tag: 'parts_a', path: '/alfa-laval-centrifuge-parts/' });
  add('missing', { tag: '' }); add('conflict', { tag: 'a' }); add('conflict', { tag: 'b' });
  add('', { tag: 'waste_oil_a' }); add(null); add('   ');
  add('organic', { source: 'chatgpt', medium: 'ai_referral' });
  add('google', { source: 'google', medium: 'cpc' });
  add('outside', { at: window.end_exclusive });
  add('query-not-page', { tag: 'waste_oil_a', path: '/waste-oil/?next=/contact-for-alfa-laval-centrifuges/' });
  const report = summarizeChatgptFunnel(db.prepare(CHATGPT_FUNNEL_SQL).all(window.start, window.end_exclusive), window);
  assert.equal(report.coverage.observed_paid_sessions, 5);
  assert.equal(report.coverage.missing_session_pageviews, 3);
  assert.equal(report.coverage.missing_ad_tag_sessions, 1);
  assert.equal(report.coverage.conflicting_ad_tag_sessions, 1);
  const waste = report.by_ad.find(row => row.ad_tag === 'waste_oil_a');
  assert.equal(waste.observed_paid_sessions, 2);
  assert.equal(waste.form_page_sessions, 1);
  assert.equal(waste.form_start_sessions, 1);
  assert.equal(waste.form_page_reach_rate, 0.5);
  const parts = report.by_ad.find(row => row.ad_tag === 'parts_a');
  assert.equal(parts.observed_paid_sessions, 1); assert.equal(parts.form_page_reach_rate, 1); assert.equal(parts.form_start_rate, 0);
  assert.equal(JSON.stringify(report).includes('private-fixture-id'), false);
  db.close();
});

test('excludes whole internal sessions and historical sessions from visitors with later test leads', () => {
  const db = fixture();
  const event = db.prepare('INSERT INTO visitor_events VALUES(?,?,?,?,?,?,?,?,?)');
  const add = (visitor, session, context = '', type = 'pageview', at = '2026-10-06T12:00:00.000Z') =>
    event.run(at, visitor, session, type, '/used-oil/', 'chatgpt', 'paid', '{"content":"oil_a"}', context);
  add('customer', 'one'); add('customer', 'one', '{}', 'form_start');
  add('customer', 'two', 'invalid-json'); // Legacy/malformed context is not an internal marker.
  add('staff', 'marked'); add('staff', 'marked', '{"internal":true}', 'form_start', window.end_exclusive);
  add('staff', 'unmarked', '{"internal":false}'); // Marker applies to the session, not every earlier visit.
  add('staff-no-session', '', '{"internal":true}');
  add('form-staff', 'marked-on-form');
  add('test-email', 'before-test'); add('test-email', 'second-session');
  add('test-name', 'before-test'); add('test-email', '', '{}');
  add('', 'anonymous'); add('customer', '', '{}');
  const lead = db.prepare('INSERT INTO submissions VALUES(?,?,?,?,?,?,?)');
  lead.run('2026-10-12T12:00:00.000Z', 'test-email', 'later-session', '{}', 'tester@example.com', '', '');
  lead.run('2026-10-12T12:00:00.000Z', 'test-name', 'later-session', '{}', 'buyer@real.invalid', 'Codex QA', '');
  lead.run('2026-10-12T12:00:00.000Z', '', '', '{}', 'tester@example.org', '', '');
  lead.run('2026-10-12T12:00:00.000Z', 'customer', 'one', '{}', 'buyer@real.invalid', 'Buyer', 'Person');
  lead.run('2026-10-12T12:00:00.000Z', 'form-staff', 'marked-on-form', '{"openai_ads":{"internal":true}}', 'staff@real.invalid', '', '');
  const report = summarizeChatgptFunnel(db.prepare(CHATGPT_FUNNEL_SQL).all(window.start, window.end_exclusive), window);
  assert.equal(report.coverage.observed_paid_sessions, 4);
  assert.equal(report.coverage.paid_pageviews, 5);
  assert.equal(report.coverage.missing_session_pageviews, 1);
  assert.equal(report.by_ad[0].form_start_sessions, 1);
  assert.equal(report.by_ad[0].form_start_rate, 0.25);
  db.close();
});

test('bounds preserve supplied account-local instants and reject partial, future or excessive windows', () => {
  const now = new Date('2026-10-12T12:00:00Z');
  const url = new URL('https://worker.example/admin/api/weekly-report?funnel_start=2026-10-04T04:00:00Z&funnel_end=2026-10-11T04:00:00Z');
  assert.deepEqual(chatgptFunnelWindow(url, now), { ...window, default_complete_utc_days: false });
  assert.equal(chatgptFunnelWindow(new URL('https://worker.example'), now, 7).end_exclusive, '2026-10-12T00:00:00.000Z');
  for (const query of ['funnel_start=2026-10-04T00:00:00&funnel_end=2026-10-11T00:00:00', 'funnel_start=2026-10-04', 'funnel_start=invalid&funnel_end=2026-10-11', 'funnel_start=2026-10-11&funnel_end=2026-10-14', 'funnel_start=2026-01-01&funnel_end=2026-10-11']) {
    assert.throws(() => chatgptFunnelWindow(new URL('https://worker.example?' + query), now));
  }
});

test('unavailable storage remains distinct from an available empty period', async () => {
  const failed = await loadChatgptFunnel({ prepare() { throw Error('offline'); } }, window);
  assert.equal(failed.status, 'unavailable'); assert.equal(failed.coverage, null);
  const empty = summarizeChatgptFunnel([], window);
  assert.equal(empty.status, 'available'); assert.equal(empty.coverage.observed_paid_sessions, 0); assert.equal(empty.coverage.tagged_session_rate, null);
});

test('existing authenticated weekly-report route returns the new aggregate with supplied bounds', async () => {
  const token = 'offline-test-token';
  const env = { REPORT_TOKEN_HASH: createHash('sha256').update(token).digest('hex'), DB: {
    prepare(sql) { return { bind() { return this; }, first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: sql === CHATGPT_FUNNEL_SQL ? [{ ad_tag: 'parts_a', sessions: 3, form_page_sessions: 3, form_start_sessions: 1, paid_pageviews: 4 }] : [] }) }; }
  } };
  const url = 'https://worker.example/admin/api/weekly-report?funnel_start=2026-10-04T04:00:00Z&funnel_end=2026-10-11T04:00:00Z';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw Error('No external transport in offline route test'); };
  try {
    const response = await worker.fetch(new Request(url, { headers: { Authorization: 'Bearer ' + token } }), env, {});
    assert.equal(response.status, 200);
    const report = await response.json();
    assert.equal(report.chatgpt_funnel.coverage.observed_paid_sessions, 3);
    assert.equal(report.chatgpt_funnel.by_ad[0].form_start_sessions, 1);
    assert.equal(report.chatgpt_funnel.window.start, window.start);
  } finally { globalThis.fetch = originalFetch; }
});
