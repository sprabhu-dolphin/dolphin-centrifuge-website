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

test('critical when D1 has sustained leads but GA4 generate_lead is silent', () => {
  const report = reconcileLeadSources(
    { contact: 2 },
    {},
    {},
    { minAbs: 2 },
  );
  assert.equal(leadReconciliationVerdict(report).status, 'CRITICAL');
  assert.match(report.alerts[0].message, /GA4 generate_lead=0/);
});

test('does not alert for one isolated D1 lead below the configured minimum', () => {
  const report = reconcileLeadSources(
    { parts_request_form: 1 },
    {},
    {},
    { minAbs: 2 },
  );
  assert.equal(leadReconciliationVerdict(report).status, 'OK');
  assert.equal(report.alerts.length, 0);
  assert.match(report.perType.find((row) => row.formType === 'parts').flag, /below 2-lead alert threshold/);
});

test('warns when Ads form conversions exceed GA4 leads', () => {
  const report = reconcileLeadSources(
    { contact: 3 },
    { centrifuge_contact_form: 3 },
    { generate_lead: 6 },
    { minAbs: 2 },
  );
  assert.equal(leadReconciliationVerdict(report).status, 'WARN');
  assert.match(report.alerts.at(-1).message, /Ads form-lead conversions=6/);
});
