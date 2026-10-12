// Observed website sessions, not Ads clicks or platform-attributed conversions.
import { D1_TEST_EXCLUSION_SQL } from '../../lead-reconciliation-core.mjs';
const PAID = "lower(source) IN ('chatgpt','openai','chatgpt.com') AND lower(medium) IN ('paid','cpc','ppc')";
const FORMS = ['/contact-for-alfa-laval-centrifuges/', '/used-oil/', '/alfa-laval-centrifuge-parts/', '/disc-centrifuge-parts-glossary/', '/used-alfa-laval-centrifuges-for-sale/'];
export const CHATGPT_FUNNEL_SQL = `
WITH internal_sessions AS (
  SELECT DISTINCT visitor_id, session_id FROM visitor_events
  WHERE CASE WHEN json_valid(visitor_context_json) THEN json_extract(visitor_context_json,'$.internal') = 1 ELSE 0 END
  UNION
  SELECT attribution_visitor_id, attribution_session_id FROM submissions
  WHERE CASE WHEN json_valid(attribution_raw_json) THEN
    json_extract(attribution_raw_json,'$.internal') = 1 OR json_extract(attribution_raw_json,'$.openai_ads.internal') = 1
    ELSE 0 END
), test_visitors AS (
  SELECT DISTINCT attribution_visitor_id AS visitor_id FROM submissions
  WHERE coalesce(trim(attribution_visitor_id),'') <> '' AND NOT (${D1_TEST_EXCLUSION_SQL})
), window_events AS (
  SELECT *, CASE WHEN event_type='pageview' AND (${PAID}) THEN 1 ELSE 0 END AS paid_view,
    CASE WHEN event_type='pageview' AND (${PAID}) AND json_valid(attribution_json)
      THEN coalesce(json_extract(attribution_json,'$.content'),'') ELSE '' END AS ad_tag
  FROM visitor_events AS event WHERE created_at >= ? AND created_at < ? AND event_type IN ('pageview','form_start')
    AND NOT EXISTS (SELECT 1 FROM internal_sessions AS internal
      WHERE internal.visitor_id IS event.visitor_id AND internal.session_id IS event.session_id)
    AND NOT EXISTS (SELECT 1 FROM test_visitors AS test WHERE test.visitor_id = event.visitor_id)
), session_events AS (
  SELECT visitor_id, session_id, sum(paid_view) AS paid_pageviews,
    count(DISTINCT CASE WHEN ad_tag <> '' THEN ad_tag END) AS tag_count,
    min(CASE WHEN ad_tag <> '' THEN ad_tag END) AS ad_tag,
    max(CASE WHEN event_type='form_start' THEN 1 ELSE 0 END) AS form_start,
    max(CASE WHEN event_type='pageview' AND (${FORMS.map(path => `rtrim(substr(page_path,1,instr(page_path || '?','?')-1),'/') IN ('${path.slice(0,-1)}','https://dolphincentrifuge.com${path.slice(0,-1)}','https://www.dolphincentrifuge.com${path.slice(0,-1)}')`).join(' OR ')}) THEN 1 ELSE 0 END) AS form_page
  FROM window_events WHERE coalesce(trim(session_id),'') <> '' GROUP BY visitor_id, session_id
)
SELECT CASE WHEN tag_count=0 THEN '(missing ad tag)' WHEN tag_count>1 THEN '(conflicting ad tags)' ELSE ad_tag END AS ad_tag,
  count(*) AS sessions, sum(form_page) AS form_page_sessions, sum(form_start) AS form_start_sessions,
  sum(paid_pageviews) AS paid_pageviews, 0 AS missing_session_pageviews
FROM session_events WHERE paid_pageviews>0 GROUP BY 1
UNION ALL
SELECT '(coverage)', 0, 0, 0, 0, coalesce(sum(paid_view),0) FROM window_events WHERE coalesce(trim(session_id),'')=''
`;

export function chatgptFunnelWindow(url, now = new Date(), days = 14) {
  const startParam = url.searchParams.get('funnel_start');
  const endParam = url.searchParams.get('funnel_end');
  const explicitInstant = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
  if ((startParam && !explicitInstant.test(startParam)) || (endParam && !explicitInstant.test(endParam))) {
    throw new Error('Use ISO timestamps with an explicit Z or UTC offset for funnel_start and funnel_end.');
  }
  const midnight = new Date(now); midnight.setUTCHours(0, 0, 0, 0);
  const start = startParam ? new Date(startParam) : new Date(midnight.getTime() - days * 86400000);
  const end = endParam ? new Date(endParam) : midnight;
  if (Boolean(startParam) !== Boolean(endParam) || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())
      || end <= start || end > now || end - start > 90 * 86400000) {
    throw new Error('Supply both funnel_start and funnel_end as past ISO timestamps, spanning at most 90 days.');
  }
  return { start: start.toISOString(), end_exclusive: end.toISOString(), default_complete_utc_days: !startParam };
}

export function summarizeChatgptFunnel(rows, window) {
  const byTag = new Map(); let missingSessionPageviews = 0;
  for (const row of rows) {
    missingSessionPageviews += Number(row.missing_session_pageviews || 0);
    if (!Number(row.sessions)) continue;
    const tag = /^[a-z0-9_-]{1,180}$/i.test(row.ad_tag) || ['(missing ad tag)', '(conflicting ad tags)'].includes(row.ad_tag) ? row.ad_tag : '(invalid ad tag)';
    const group = byTag.get(tag) || { ad_tag: tag, observed_paid_sessions: 0, form_page_sessions: 0, form_start_sessions: 0, paid_pageviews: 0 };
    group.observed_paid_sessions += Number(row.sessions || 0);
    group.form_page_sessions += Number(row.form_page_sessions || 0);
    group.form_start_sessions += Number(row.form_start_sessions || 0);
    group.paid_pageviews += Number(row.paid_pageviews || 0);
    byTag.set(tag, group);
  }
  const groups = [...byTag.values()].sort((a, b) => a.ad_tag.localeCompare(b.ad_tag));
  for (const group of groups) {
    group.form_page_reach_rate = group.form_page_sessions / group.observed_paid_sessions;
    group.form_start_rate = group.form_start_sessions / group.observed_paid_sessions;
  }
  const total = key => groups.reduce((n, group) => n + group[key], 0);
  const tagged = groups.filter(group => !group.ad_tag.startsWith('(')).reduce((n, group) => n + group.observed_paid_sessions, 0);
  return {
    status: 'available', window,
    definition: 'One observed session with a ChatGPT/OpenAI paid pageview, excluding internally marked sessions and visitors linked to test leads, including leads submitted after the reporting window. Form-page reach is visiting one of the five inquiry pages; form start is field engagement. A form landing page can have 100% reach without engagement.',
    coverage_note: 'Website-observed traffic only; blockers, missing session IDs, tests/bots and lost attribution may affect coverage. Counts are not Ads clicks, people, qualified leads or causal experiment results. Supply explicit account-local window bounds as UTC timestamps for comparisons.',
    coverage: { observed_paid_sessions: total('observed_paid_sessions'), tagged_sessions: tagged,
      tagged_session_rate: total('observed_paid_sessions') ? tagged / total('observed_paid_sessions') : null,
      paid_pageviews: total('paid_pageviews') + missingSessionPageviews,
      missing_session_pageviews: missingSessionPageviews,
      missing_ad_tag_sessions: byTag.get('(missing ad tag)')?.observed_paid_sessions || 0,
      conflicting_ad_tag_sessions: byTag.get('(conflicting ad tags)')?.observed_paid_sessions || 0,
      invalid_ad_tag_sessions: byTag.get('(invalid ad tag)')?.observed_paid_sessions || 0 },
    by_ad: groups,
  };
}

export async function loadChatgptFunnel(db, window) {
  try {
    const result = await db.prepare(CHATGPT_FUNNEL_SQL).bind(window.start, window.end_exclusive).all();
    return summarizeChatgptFunnel(result.results || [], window);
  } catch {
    return { status: 'unavailable', window, coverage: null, by_ad: null };
  }
}
