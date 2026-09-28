import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLeadMonitorWindow, leadReconciliationVerdict, reconcileLeadSources } from './lead-reconciliation-core.mjs';

test('builds a complete-day rolling monitor window', () => {
  const window = buildLeadMonitorWindow({
    now: new Date('2026-06-26T12:00:00.000Z'),
    days: 14,
    endOffsetDays: 1,
  });
  assert.deepEqual(window, {
    start: '2026-06-12',
    end: '2026-06-25',
    endExclusive: '2026-06-26',
    days: 14,
  });
});

test('one unmatched parts lead is low-n info, not a warning', () => {
  const report = reconcileLeadSources(
    { contact: 15, parts_request_form: 1 },
    { centrifuge_contact_form: 13 },
    {},
  );
  assert.equal(leadReconciliationVerdict(report).status, 'OK');
  assert.match(report.info.join('\n'), /parts.*low-n, no verdict/);
});

test('warns when a form with n>=10 matches under 70% in GA4, keyed by submission id', () => {
  const report = reconcileLeadSources(
    { contact: 10 },
    { centrifuge_contact_form: 6 },
    {},
    { d1Ids: { contact: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
  );
  assert.equal(leadReconciliationVerdict(report).status, 'WARN');
  assert.equal(report.alerts[0].keys.length, 10);
  assert.equal(report.alerts[0].keys[0], 'sub:1');
});

test('critical only when GA4 is silent across all forms with D1 >= 3', () => {
  assert.equal(leadReconciliationVerdict(reconcileLeadSources({ contact: 3 }, {}, {})).status, 'CRITICAL');
  assert.equal(leadReconciliationVerdict(reconcileLeadSources({ contact: 2 }, {}, {})).status, 'OK');
});

test('ads warns only on zero conversions with spend and >=3 paid D1 leads', () => {
  const base = { contact: 4 };
  const ga4 = { centrifuge_contact_form: 4 };
  const warn = reconcileLeadSources(base, ga4, {}, { adsSpend: 120, d1PaidIds: [1, 2, 3] });
  assert.equal(leadReconciliationVerdict(warn).status, 'WARN');
  assert.match(warn.alerts[0].message, /0 form-lead conversions/);
  assert.equal(leadReconciliationVerdict(reconcileLeadSources(base, ga4, {}, { adsSpend: 120, d1PaidIds: [1, 2] })).status, 'OK');
  assert.equal(leadReconciliationVerdict(reconcileLeadSources(base, ga4, {}, { adsSpend: 0, d1PaidIds: [1, 2, 3] })).status, 'OK');
  assert.equal(leadReconciliationVerdict(reconcileLeadSources(base, ga4, { 'Lead form - generate_lead': 1 }, { adsSpend: 120, d1PaidIds: [1, 2, 3] })).status, 'OK');
});
