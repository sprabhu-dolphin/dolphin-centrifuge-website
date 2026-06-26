// =============================================================
// Dolphin Centrifuge — Contact Form Cloudflare Worker
// Routes:
//   POST /                       → Process form, save to D1, send email
//   GET  /admin/submissions      → Return all submissions as JSON (auth required)
//   DELETE /admin/submissions/:id → Soft-delete a submission (auth required)
// Secrets: RESEND_API_KEY, ADMIN_PASSWORD, TURNSTILE_SECRET_KEY (optional)
// =============================================================

import {
  DEFAULT_ADS_CUSTOMER_ID,
  DEFAULT_ADS_LOGIN_CUSTOMER_ID,
  DEFAULT_GA4_PROPERTY_ID,
  D1_TEST_EXCLUSION_SQL,
  buildLeadMonitorWindow,
  formatLeadReconciliationText,
  leadReconciliationVerdict,
  normalizeAdsCustomerId,
  reconcileLeadSources,
} from '../../lead-reconciliation-core.mjs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env, ctx) {

    // ── CORS preflight ───────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Route: GET /admin/submissions ────────────────────────
    if (request.method === 'GET' && path === '/admin/submissions') {
      return handleAdminGet(request, env);
    }

    if (request.method === 'GET' && path === '/admin/visitors') {
      return handleAdminVisitorsGet(request, env);
    }

    if (request.method === 'GET' && path.startsWith('/admin/visitors/') && path.endsWith('/events')) {
      const visitorId = safeDecodeURIComponent(path.slice('/admin/visitors/'.length).replace(/\/events$/, ''));
      return handleAdminVisitorEventsGet(request, env, visitorId);
    }

    if (request.method === 'GET' && path === '/admin/calls') {
      return handleAdminCallsGet(request, env);
    }

    if (request.method === 'GET' && path === '/admin/summary') {
      return handleAdminSummary(request, env);
    }

    if (request.method === 'GET' && path === '/admin/lead-monitor') {
      return handleAdminLeadMonitor(request, env);
    }

    if (request.method === 'GET' && path === '/admin/pages') {
      return handleAdminPages(request, env);
    }

    if (request.method === 'POST' && path.startsWith('/admin/visitors/')) {
      const visitorId = decodeURIComponent(path.split('/').pop() || '');
      return handleAdminVisitorUpdate(request, env, visitorId);
    }

    if (request.method === 'POST' && path === '/admin/calls/ingest') {
      return handleAdminCallIngest(request, env);
    }

    // ── Route: DELETE /admin/submissions/:id ─────────────────
    if (request.method === 'DELETE' && path.startsWith('/admin/submissions/')) {
      const id = path.split('/').pop();
      return handleAdminDelete(request, env, id);
    }

    // ── Route: POST / (form submission) ─────────────────────
    if (request.method === 'POST') {
      if (path === '/track/event') {
        return handleVisitorEvent(request, env, ctx);
      }
      if (path === '/track/pageview') {
        return handlePageview(request, env, ctx);
      }
      if (path === '/parts') {
        return handlePartsSubmit(request, env);
      }
      return handleFormSubmit(request, env);
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: CORS_HEADERS }
    );
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(handleScheduledLeadMonitor(controller, env));
  },
};

// ── ADMIN: Get all submissions ───────────────────────────────
// Admin list cap — a safety ceiling per request. The dashboard bounds the real
// dataset with a date range; this just prevents an unbounded fetch. `truncated`
// in the response tells the client to narrow the range (or move to server paging).
const ADMIN_LIST_LIMIT = 10000;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function endExclusiveDate(end) {
  // `end` is an inclusive YYYY-MM-DD; return the next UTC day for a `< ?` compare.
  const d = new Date(`${end}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Build an optional date-range WHERE fragment for `column` from ?start=&end=.
// Only well-formed YYYY-MM-DD values are honored; values bind as parameters
// (the column name is caller-controlled, never user input).
function buildDateFilter(request, column) {
  const url = new URL(request.url);
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  let clause = '';
  const binds = [];
  if (start && ISO_DATE_RE.test(start)) { clause += ` AND ${column} >= ?`; binds.push(start); }
  if (end && ISO_DATE_RE.test(end)) { clause += ` AND ${column} < ?`; binds.push(endExclusiveDate(end)); }
  return { clause, binds };
}

async function handleAdminGet(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  try {
    let results;
    try {
      const f = buildDateFilter(request, 's.created_at');
      const response = await env.DB.prepare(`
        SELECT
          s.*,
          vp.label AS visitor_label,
          vp.contact_name AS visitor_contact_name,
          vp.contact_company AS visitor_contact_company,
          vp.contact_email AS visitor_contact_email,
          vp.contact_phone AS visitor_contact_phone,
          vp.identity_source AS visitor_identity_source,
          vp.identity_confidence AS visitor_identity_confidence,
          vp.identity_updated_at AS visitor_identity_updated_at,
          vp.alert_enabled AS visitor_alert_enabled,
          vp.alert_email AS visitor_alert_email,
          vp.notes AS visitor_notes,
          vp.visit_count AS visitor_profile_visit_count,
          vp.pageview_count AS visitor_profile_pageview_count,
          vp.last_seen_at AS visitor_profile_last_seen_at
        FROM submissions s
        LEFT JOIN visitor_profiles vp
          ON s.attribution_visitor_id = vp.visitor_id
        WHERE s.deleted = 0${f.clause}
        ORDER BY s.created_at DESC
        LIMIT ${ADMIN_LIST_LIMIT}
      `).bind(...f.binds).all();
      results = response.results;
    } catch (joinErr) {
      if (!isMissingColumnError(joinErr)) throw joinErr;
      const f = buildDateFilter(request, 'created_at');
      const response = await env.DB.prepare(
        `SELECT * FROM submissions WHERE deleted = 0${f.clause} ORDER BY created_at DESC LIMIT ${ADMIN_LIST_LIMIT}`
      ).bind(...f.binds).all();
      results = response.results;
    }

    return new Response(JSON.stringify({ success: true, data: results, truncated: results.length >= ADMIN_LIST_LIMIT }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error('Admin GET error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

// ── ADMIN: Soft-delete a submission ─────────────────────────
async function handleAdminDelete(request, env, id) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  if (!id || isNaN(Number(id))) {
    return new Response(JSON.stringify({ error: 'Invalid id' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  try {
    await env.DB.prepare(
      `UPDATE submissions SET deleted = 1 WHERE id = ?`
    ).bind(Number(id)).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error('Admin DELETE error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

// ── Check admin Authorization header ────────────────────────
async function handleAdminVisitorsGet(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  try {
    const f = buildDateFilter(request, 'last_seen_at');
    const { results } = await env.DB.prepare(`
      SELECT *
      FROM visitor_profiles
      WHERE 1=1${f.clause}
      ORDER BY last_seen_at DESC
      LIMIT ${ADMIN_LIST_LIMIT}
    `).bind(...f.binds).all();

    return new Response(JSON.stringify({ success: true, data: results, truncated: results.length >= ADMIN_LIST_LIMIT }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    if (isMissingColumnError(err)) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200, headers: CORS_HEADERS,
      });
    }
    console.error('Admin visitors GET error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

// ── ADMIN: summary KPI tiles over a date range ──────────────
function formTimelineTarget(row) {
  const formType = cleanText(row.form_type || 'contact', 80);
  if (formType === 'parts') return 'Parts request';
  if (formType === 'contact') return 'Contact form';
  return formType || 'Form';
}

function formTimelineContact(row) {
  return [row.first_name, row.last_name, row.company]
    .map((value) => cleanText(value, 120))
    .filter(Boolean)
    .join(' ');
}

function compareTimelineRows(a, b) {
  const aTime = String(a.created_at || '');
  const bTime = String(b.created_at || '');
  if (aTime !== bTime) return aTime < bTime ? -1 : 1;
  const aOrder = Number(a._sort_id || 0);
  const bOrder = Number(b._sort_id || 0);
  if (aOrder !== bOrder) return aOrder - bOrder;
  return String(a.event_type || '').localeCompare(String(b.event_type || ''));
}

async function handleAdminVisitorEventsGet(request, env, visitorId) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  const cleanVisitorId = cleanText(visitorId, 140);
  if (!cleanVisitorId) {
    return new Response(JSON.stringify({ error: 'Missing visitor id' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  try {
    let events = [];
    let submissions = [];
    let calls = [];

    try {
      const response = await env.DB.prepare(`
        SELECT id, created_at, event_type, page_path, page_title, attribution_json
        FROM visitor_events
        WHERE visitor_id = ?
        ORDER BY created_at ASC, id ASC
        LIMIT 500
      `).bind(cleanVisitorId).all();
      events = (response.results || []).map((row) => ({
        created_at: row.created_at,
        event_type: row.event_type,
        page_path: row.page_path,
        page_title: row.page_title,
        attribution_json: row.attribution_json,
        _sort_id: Number(row.id || 0),
      }));
    } catch (eventErr) {
      if (!isMissingColumnError(eventErr) && !isMissingTableError(eventErr)) throw eventErr;
    }

    try {
      const response = await env.DB.prepare(`
        SELECT id, created_at, first_name, last_name, company, form_type, attribution_current_page
        FROM submissions
        WHERE deleted = 0 AND attribution_visitor_id = ?
        ORDER BY created_at ASC, id ASC
        LIMIT 500
      `).bind(cleanVisitorId).all();
      submissions = (response.results || []).map((row) => {
        const target = formTimelineTarget(row);
        return {
          created_at: row.created_at,
          event_type: 'form_submit',
          page_path: cleanText(row.attribution_current_page, 700),
          page_title: target,
          attribution_json: safeJson({
            target,
            link_text: formTimelineContact(row),
          }, 2000),
          _sort_id: Number(row.id || 0) + 1000000000,
        };
      });
    } catch (submissionErr) {
      if (!isMissingColumnError(submissionErr) && !isMissingTableError(submissionErr)) throw submissionErr;
    }

    try {
      const response = await env.DB.prepare(`
        SELECT
          id, created_at, caller_raw, caller_phone_e164, mailbox, duration_seconds,
          transcript_snippet, transcript_available, source_display_url, matched_submission_id
        FROM calls
        WHERE deleted = 0 AND matched_visitor_id = ?
        ORDER BY created_at ASC, id ASC
        LIMIT 500
      `).bind(cleanVisitorId).all();
      calls = (response.results || []).map((row) => ({
        created_at: row.created_at,
        event_type: 'phone_voicemail',
        page_path: '',
        page_title: cleanText(row.mailbox || 'Talkroute voicemail', 200),
        attribution_json: safeJson({
          target: row.caller_raw || row.caller_phone_e164,
          link_text: row.transcript_available ? row.transcript_snippet : '',
          mailbox: row.mailbox,
          duration_seconds: row.duration_seconds,
          source: 'Talkroute voicemail',
          source_display_url: row.source_display_url,
          matched_submission_id: row.matched_submission_id,
        }, 9000),
        _sort_id: Number(row.id || 0) + 2000000000,
      }));
    } catch (callErr) {
      if (!isMissingColumnError(callErr) && !isMissingTableError(callErr)) throw callErr;
    }

    const results = events
      .concat(submissions)
      .concat(calls)
      .sort(compareTimelineRows)
      .slice(0, 500)
      .map(({ _sort_id, ...row }) => row);

    return new Response(JSON.stringify({ success: true, data: results || [] }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    if (isMissingColumnError(err) || isMissingTableError(err)) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200, headers: CORS_HEADERS,
      });
    }
    console.error('Admin visitor events GET error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

async function handleAdminCallsGet(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  try {
    const f = buildDateFilter(request, 'c.created_at');
    const response = await env.DB.prepare(`
      SELECT
        c.*,
        vp.label AS visitor_label,
        vp.contact_name AS visitor_contact_name,
        vp.contact_company AS visitor_contact_company,
        vp.contact_email AS visitor_contact_email,
        vp.contact_phone AS visitor_contact_phone,
        vp.identity_source AS visitor_identity_source,
        vp.identity_confidence AS visitor_identity_confidence,
        s.first_name AS submission_first_name,
        s.last_name AS submission_last_name,
        s.company AS submission_company,
        s.email AS submission_email,
        s.phone AS submission_phone,
        s.form_type AS submission_form_type
      FROM calls c
      LEFT JOIN visitor_profiles vp
        ON c.matched_visitor_id = vp.visitor_id
      LEFT JOIN submissions s
        ON c.matched_submission_id = s.id
      WHERE c.deleted = 0${f.clause}
      ORDER BY c.created_at DESC
      LIMIT ${ADMIN_LIST_LIMIT}
    `).bind(...f.binds).all();

    const results = response.results || [];
    return new Response(JSON.stringify({ success: true, data: results, truncated: results.length >= ADMIN_LIST_LIMIT }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    if (isMissingColumnError(err) || isMissingTableError(err)) {
      return new Response(JSON.stringify({ success: true, data: [], truncated: false }), {
        status: 200, headers: CORS_HEADERS,
      });
    }
    console.error('Admin calls GET error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

async function handleAdminCallIngest(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  let body = {};
  try {
    body = await readJsonRequest(request);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  const records = Array.isArray(body)
    ? body
    : (Array.isArray(body.calls) ? body.calls : (Array.isArray(body.messages) ? body.messages : [body]));
  const cleanRecords = records.filter((record) => record && typeof record === 'object');

  if (!cleanRecords.length) {
    return new Response(JSON.stringify({ error: 'No call records provided' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  const results = [];
  let inserted = 0;
  let updated = 0;
  let matched = 0;

  try {
    for (const raw of cleanRecords) {
      const call = normalizeCallRecord(raw);
      if (!call.sourceMessageId) {
        results.push({ success: false, error: 'Missing Gmail message id', subject: call.emailSubject });
        continue;
      }

      const match = await findCallPhoneMatch(env, call.callerPhoneDigits);
      call.matchedSubmissionId = match.submissionId;
      call.matchedVisitorId = match.visitorId;
      call.matchStatus = match.status;
      call.matchConfidence = match.confidence;
      call.matchedAt = match.visitorId ? new Date().toISOString() : '';

      const upsert = await upsertCallRecord(env, call, raw);
      if (upsert.existed) updated += 1; else inserted += 1;
      if (call.matchedVisitorId) matched += 1;

      if (match.submission) {
        await updateVisitorIdentityFromCallMatch(env, match.submission, call);
      }

      results.push({
        success: true,
        id: upsert.id,
        source_message_id: call.sourceMessageId,
        caller_phone: call.callerRaw || call.callerPhoneE164,
        mailbox: call.mailbox,
        match_status: call.matchStatus,
        matched_submission_id: call.matchedSubmissionId,
        matched_visitor_id: call.matchedVisitorId,
      });
    }

    return new Response(JSON.stringify({ success: true, inserted, updated, matched, data: results }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    if (isMissingColumnError(err) || isMissingTableError(err)) {
      return new Response(JSON.stringify({ error: 'Calls table is not installed yet' }), {
        status: 500, headers: CORS_HEADERS,
      });
    }
    console.error('Admin call ingest error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

async function handleAdminSummary(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }
  try {
    // Pageviews / unique visitors / sessions from the event log (pageview events only,
    // so download/exit-link events added later don't inflate the pageview count).
    let pageviews = 0, visitors = 0, sessions = 0;
    try {
      const ev = buildDateFilter(request, 'created_at');
      const r = await env.DB.prepare(
        `SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS v, COUNT(DISTINCT session_id) AS s
         FROM visitor_events WHERE event_type = 'pageview'${ev.clause}`
      ).bind(...ev.binds).first();
      pageviews = Number(r?.pv || 0);
      visitors = Number(r?.v || 0);
      sessions = Number(r?.s || 0);
    } catch (evErr) {
      if (!isMissingColumnError(evErr) && !isMissingTableError(evErr)) throw evErr; // missing table/column -> leave at 0
    }

    // Form leads from submissions over the same range.
    let leads = 0;
    try {
      const sf = buildDateFilter(request, 'created_at');
      const r = await env.DB.prepare(
        `SELECT COUNT(*) AS n FROM submissions WHERE deleted = 0${sf.clause}`
      ).bind(...sf.binds).first();
      leads = Number(r?.n || 0);
    } catch (subErr) {
      if (!isMissingColumnError(subErr) && !isMissingTableError(subErr)) throw subErr;
    }

    let calls = 0;
    try {
      const cf = buildDateFilter(request, 'created_at');
      const r = await env.DB.prepare(
        `SELECT COUNT(*) AS n FROM calls WHERE deleted = 0${cf.clause}`
      ).bind(...cf.binds).first();
      calls = Number(r?.n || 0);
    } catch (callErr) {
      if (!isMissingColumnError(callErr) && !isMissingTableError(callErr)) throw callErr;
    }

    return new Response(JSON.stringify({ success: true, pageviews, visitors, sessions, leads, calls }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error('Admin summary error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

// ── ADMIN: Top / Entry / Exit pages over a date range ───────
async function handleAdminLeadMonitor(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  const url = new URL(request.url);
  try {
    const result = await runLeadMonitor(env, {
      start: url.searchParams.get('start') || undefined,
      end: url.searchParams.get('end') || undefined,
      days: url.searchParams.get('days') || undefined,
      endOffsetDays: url.searchParams.get('end_offset_days') || url.searchParams.get('endOffsetDays') || undefined,
      undercountTolerance: url.searchParams.get('undercount_tolerance') || url.searchParams.get('undercountTolerance') || undefined,
      minAbs: url.searchParams.get('min_abs') || url.searchParams.get('minAbs') || undefined,
      sendAlert: truthyParam(url.searchParams.get('send')),
      forceAlert: truthyParam(url.searchParams.get('force')),
      source: 'manual',
    });
    return new Response(JSON.stringify(result), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('Lead monitor manual run error:', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

async function handleScheduledLeadMonitor(controller, env) {
  const scheduledTime = controller?.scheduledTime ? new Date(controller.scheduledTime) : new Date();
  try {
    const result = await runLeadMonitor(env, {
      now: scheduledTime,
      sendAlert: true,
      source: 'scheduled',
    });
    if (result.skipped) {
      console.warn(`Lead monitor skipped: ${result.reason || 'not configured'}`);
    } else {
      const verdict = leadReconciliationVerdict(result.report);
      console.log(`Lead monitor ${verdict.status}: ${verdict.critical} critical, ${verdict.warn} warn`);
    }
  } catch (err) {
    console.error('Lead monitor scheduled run error:', err.message);
    await sendLeadMonitorFailureAlert(env, err, scheduledTime);
  }
}

async function runLeadMonitor(env, opts = {}) {
  const sendAlert = Boolean(opts.sendAlert);
  const missing = missingLeadMonitorConfig(env, { sendAlert });
  if (missing.length) {
    return {
      success: false,
      skipped: true,
      reason: 'missing required Worker secrets or bindings',
      missing,
      readOnly: true,
      alertSent: false,
    };
  }

  const window = buildLeadMonitorWindow({
    days: opts.days || env.LEAD_MONITOR_DAYS || 14,
    start: opts.start,
    end: opts.end,
    endOffsetDays: opts.endOffsetDays ?? env.LEAD_MONITOR_END_OFFSET_DAYS ?? 1,
    now: opts.now || new Date(),
  });

  const [d1, ga4, ads] = await Promise.all([
    pullLeadMonitorD1(env, window.start, window.endExclusive),
    pullLeadMonitorGA4(env, window.start, window.end),
    pullLeadMonitorAds(env, window.start, window.end),
  ]);

  const report = reconcileLeadSources(d1, ga4, ads, {
    undercountTolerance: opts.undercountTolerance ?? env.LEAD_MONITOR_UNDERCOUNT_TOLERANCE,
    minAbs: opts.minAbs ?? env.LEAD_MONITOR_MIN_ABS,
  });
  const verdict = leadReconciliationVerdict(report);
  const ctx = { window: { start: window.start, end: window.end }, d1, ga4, ads };

  let alertSent = false;
  if (sendAlert && (report.alerts.length || opts.forceAlert)) {
    await sendLeadMonitorAlert(env, report, ctx, {
      source: opts.source || 'scheduled',
      forced: Boolean(opts.forceAlert),
    });
    alertSent = true;
  }

  return {
    success: true,
    skipped: false,
    readOnly: true,
    alertSent,
    source: opts.source || 'manual',
    window: ctx.window,
    verdict,
    sources: { d1, ga4, ads },
    report,
  };
}

async function pullLeadMonitorD1(env, startDate, endExclusive) {
  const response = await env.DB.prepare(`
    SELECT form_type, COUNT(*) AS n
    FROM submissions
    WHERE deleted = 0
      AND created_at >= ?
      AND created_at < ?
      AND ${D1_TEST_EXCLUSION_SQL}
    GROUP BY form_type
  `).bind(startDate, endExclusive).all();

  const byType = {};
  for (const row of response.results || []) {
    byType[row.form_type || '(none)'] = Number(row.n || 0);
  }
  return byType;
}

async function pullLeadMonitorGA4(env, startDate, endDate) {
  const oauth = googleOAuthConfig(env, 'GA4');
  const accessToken = await refreshGoogleAccessToken({
    ...oauth,
    refreshToken: env.GA4_REFRESH_TOKEN,
    label: 'GA4',
  });
  const property = cleanText(env.GA4_PROPERTY_ID || DEFAULT_GA4_PROPERTY_ID, 80);
  const payload = {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'customEvent:lead_form' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { matchType: 'EXACT', value: 'generate_lead', caseSensitive: false },
      },
    },
    limit: 100,
  };
  const body = await googleJsonFetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    label: 'GA4 runReport',
  });

  const dimHeaders = (body.dimensionHeaders || []).map((h) => h.name);
  const metHeaders = (body.metricHeaders || []).map((h) => h.name);
  const byForm = {};
  for (const row of body.rows || []) {
    const out = {};
    (row.dimensionValues || []).forEach((v, i) => { out[dimHeaders[i]] = v.value; });
    (row.metricValues || []).forEach((v, i) => { out[metHeaders[i]] = v.value; });
    byForm[out['customEvent:lead_form'] || '(not set)'] = Number(out.eventCount || 0);
  }
  return byForm;
}

async function pullLeadMonitorAds(env, startDate, endDate) {
  const oauth = googleOAuthConfig(env, 'GOOGLE_ADS');
  const accessToken = await refreshGoogleAccessToken({
    ...oauth,
    refreshToken: env.GOOGLE_ADS_REFRESH_TOKEN,
    label: 'Google Ads',
  });
  const apiVersion = cleanText(env.GOOGLE_ADS_API_VERSION || 'v24', 12);
  const customerId = normalizeAdsCustomerId(env.GOOGLE_ADS_CUSTOMER_ID || DEFAULT_ADS_CUSTOMER_ID);
  const loginCustomerId = normalizeAdsCustomerId(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || DEFAULT_ADS_LOGIN_CUSTOMER_ID);
  const sql = `
    SELECT segments.conversion_action_name, metrics.conversions, metrics.all_conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND metrics.all_conversions > 0
  `;
  const body = await googleJsonFetch(`https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:searchStream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': env.GOOGLE_ADS_DEVELOPER_TOKEN,
      'login-customer-id': loginCustomerId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
    label: 'Google Ads searchStream',
  });

  const rows = Array.isArray(body) ? body.flatMap((chunk) => chunk.results || []) : [];
  const byAction = {};
  for (const row of rows) {
    const name = row.segments?.conversionActionName || '(unknown)';
    byAction[name] = (byAction[name] || 0) + Number(row.metrics?.conversions || 0);
  }
  return byAction;
}

async function refreshGoogleAccessToken({ clientId, clientSecret, refreshToken, tokenUri, label }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const parsed = await googleJsonFetch(tokenUri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    label: `${label || 'Google'} token refresh`,
  });
  if (!parsed.access_token) throw new Error(`${label || 'Google'} token refresh returned no access_token`);
  return parsed.access_token;
}

async function googleJsonFetch(url, options) {
  const label = options.label || 'Google API';
  const { label: _label, ...fetchOptions } = options;
  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch (err) {
    parsed = { raw: text };
  }
  if (!response.ok) {
    const requestId = response.headers.get('request-id') || response.headers.get('google-ads-request-id') || '';
    throw new Error(`${label} ${response.status}${requestId ? ` request-id ${requestId}` : ''}: ${JSON.stringify(parsed).slice(0, 1200)}`);
  }
  return parsed;
}

function googleOAuthConfig(env, prefix) {
  return {
    clientId: env[`${prefix}_CLIENT_ID`] || env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env[`${prefix}_CLIENT_SECRET`] || env.GOOGLE_OAUTH_CLIENT_SECRET,
    tokenUri: env[`${prefix}_TOKEN_URI`] || env.GOOGLE_OAUTH_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  };
}

function missingLeadMonitorConfig(env, opts = {}) {
  const missing = [];
  if (!env.DB) missing.push('DB');
  const ga4 = googleOAuthConfig(env, 'GA4');
  const ads = googleOAuthConfig(env, 'GOOGLE_ADS');
  if (!ga4.clientId) missing.push('GA4_CLIENT_ID or GOOGLE_OAUTH_CLIENT_ID');
  if (!ga4.clientSecret) missing.push('GA4_CLIENT_SECRET or GOOGLE_OAUTH_CLIENT_SECRET');
  if (!env.GA4_REFRESH_TOKEN) missing.push('GA4_REFRESH_TOKEN');
  if (!ads.clientId) missing.push('GOOGLE_ADS_CLIENT_ID or GOOGLE_OAUTH_CLIENT_ID');
  if (!ads.clientSecret) missing.push('GOOGLE_ADS_CLIENT_SECRET or GOOGLE_OAUTH_CLIENT_SECRET');
  if (!env.GOOGLE_ADS_REFRESH_TOKEN) missing.push('GOOGLE_ADS_REFRESH_TOKEN');
  if (!env.GOOGLE_ADS_DEVELOPER_TOKEN) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN');
  if (opts.sendAlert && !env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
  return missing;
}

async function sendLeadMonitorAlert(env, report, ctx, meta = {}) {
  const verdict = leadReconciliationVerdict(report);
  const title = verdict.status === 'CRITICAL'
    ? 'Dolphin CRITICAL: lead tracking drift'
    : verdict.status === 'WARN'
      ? 'Dolphin warning: lead tracking drift'
      : 'Dolphin lead monitor check';
  const dashboardUrl = adminDashboardUrl(env);
  const reconciliationText = formatLeadReconciliationText(report, ctx);
  const text = [
    title,
    '',
    `Source: ${meta.source || 'scheduled'}${meta.forced ? ' (forced send)' : ''}`,
    'Read-only check: no D1, GA4, Google Ads, Cloudflare, or site settings were changed.',
    '',
    reconciliationText,
    '',
    `Dashboard: ${dashboardUrl}`,
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:780px;line-height:1.45;">
      <div style="border-bottom:4px solid #c9a45c;padding-bottom:12px;margin-bottom:18px;">
        <p style="margin:0 0 4px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.04em;">Dolphin lead monitor</p>
        <h2 style="color:#0a2540;margin:0;font-size:24px;">${esc(title)}</h2>
      </div>
      <p style="margin:0 0 14px;color:#475569;">Read-only check. No D1, GA4, Google Ads, Cloudflare, or site settings were changed.</p>
      <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #d9e2ec;border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.45;">${esc(reconciliationText)}</pre>
      <p style="margin:24px 0 8px;">
        <a href="${esc(dashboardUrl)}" style="display:inline-block;background:#0a2540;color:#fff;text-decoration:none;padding:11px 16px;border-radius:6px;font-weight:bold;">Open Dolphin dashboard</a>
      </p>
    </div>
  `;
  await sendLeadMonitorEmail(env, title, text, html);
}

async function sendLeadMonitorFailureAlert(env, error, scheduledTime) {
  if (!env.RESEND_API_KEY) return;
  const title = 'Dolphin lead monitor failed';
  const when = scheduledTime ? scheduledTime.toISOString() : new Date().toISOString();
  const text = [
    title,
    '',
    `When: ${when}`,
    'The scheduled read-only lead monitor could not complete, so D1, GA4, and Google Ads were not reconciled.',
    '',
    `Error: ${error.message}`,
    '',
    `Dashboard: ${adminDashboardUrl(env)}`,
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:760px;line-height:1.45;">
      <h2 style="color:#9f1239;margin:0 0 12px;">${esc(title)}</h2>
      <p>The scheduled read-only lead monitor could not complete, so D1, GA4, and Google Ads were not reconciled.</p>
      <pre style="white-space:pre-wrap;background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;padding:14px 16px;">${esc(error.message)}</pre>
      <p><a href="${esc(adminDashboardUrl(env))}" style="color:#145c9e;">Open Dolphin dashboard</a></p>
    </div>
  `;
  await sendLeadMonitorEmail(env, title, text, html);
}

async function sendLeadMonitorEmail(env, subject, text, html) {
  if (!env.RESEND_API_KEY) return;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Dolphin Lead Monitor <noreply@dolphincentrifuge.com>',
      to: leadMonitorRecipients(env),
      subject,
      text,
      html,
    }),
  });
  if (!response.ok) {
    console.error('Lead monitor alert email error:', await response.text());
  }
}

function leadMonitorRecipients(env) {
  const raw = cleanText(env.LEAD_MONITOR_ALERT_TO || 'sales@dolphincentrifuge.com', 1000);
  return raw.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
}

function truthyParam(value) {
  return /^(1|true|yes|send)$/i.test(String(value || '').trim());
}

async function handleAdminPages(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }
  const out = { success: true, top: [], entry: [], exit: [] };
  try {
    const f = buildDateFilter(request, 'created_at');
    const where = `event_type = 'pageview'${f.clause}`;
    const tolerate = (e) => { if (!isMissingColumnError(e) && !isMissingTableError(e)) throw e; };

    // Top pages — by sessions touching the page.
    try {
      const r = await env.DB.prepare(
        `SELECT page_path AS page, COUNT(*) AS pageviews, COUNT(DISTINCT session_id) AS sessions
         FROM visitor_events WHERE ${where}
         GROUP BY page_path ORDER BY sessions DESC, pageviews DESC LIMIT 50`
      ).bind(...f.binds).all();
      out.top = r.results || [];
    } catch (e) { tolerate(e); }

    // Entry pages (first pageview per session) + bounce (single-pageview sessions).
    try {
      const r = await env.DB.prepare(
        `WITH ranked AS (
           SELECT session_id, page_path,
             COUNT(*) OVER (PARTITION BY session_id) AS pv_count,
             ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC, id ASC) AS rn
           FROM visitor_events WHERE ${where}
         )
         SELECT page_path AS page, COUNT(*) AS sessions,
                SUM(CASE WHEN pv_count = 1 THEN 1 ELSE 0 END) AS bounced
         FROM ranked WHERE rn = 1
         GROUP BY page_path ORDER BY sessions DESC LIMIT 50`
      ).bind(...f.binds).all();
      out.entry = r.results || [];
    } catch (e) { tolerate(e); }

    // Exit pages (last pageview per session).
    try {
      const r = await env.DB.prepare(
        `WITH ranked AS (
           SELECT session_id, page_path,
             ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC, id DESC) AS rn
           FROM visitor_events WHERE ${where}
         )
         SELECT page_path AS page, COUNT(*) AS sessions
         FROM ranked WHERE rn = 1
         GROUP BY page_path ORDER BY sessions DESC LIMIT 50`
      ).bind(...f.binds).all();
      out.exit = r.results || [];
    } catch (e) { tolerate(e); }

    return new Response(JSON.stringify(out), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('Admin pages error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

async function handleAdminVisitorUpdate(request, env, visitorId) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  const cleanVisitorId = cleanText(visitorId, 140);
  if (!cleanVisitorId) {
    return new Response(JSON.stringify({ error: 'Missing visitor id' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  let body = {};
  try {
    body = await readJsonRequest(request);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  const label = cleanText(body.label, 160);
  const contactName = cleanText(body.contact_name, 200);
  const contactCompany = cleanText(body.contact_company, 200);
  const contactEmail = cleanText(body.contact_email, 200).toLowerCase();
  const contactPhone = cleanText(body.contact_phone, 80);
  const identitySource = cleanText(body.identity_source || 'manual', 80);
  const identityConfidence = cleanText(body.identity_confidence || 'manual-confirmed', 80);
  const alertEnabled = body.alert_enabled ? 1 : 0;
  const alertEmail = cleanText(body.alert_email || 'sales@dolphincentrifuge.com', 180);
  const notes = cleanText(body.notes, 1000);
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(`
      INSERT INTO visitor_profiles (
        visitor_id, first_seen_at, last_seen_at,
        label, contact_name, contact_company, contact_email, contact_phone,
        identity_source, identity_confidence, identity_updated_at,
        alert_enabled, alert_email, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(visitor_id) DO UPDATE SET
        label = excluded.label,
        contact_name = excluded.contact_name,
        contact_company = excluded.contact_company,
        contact_email = excluded.contact_email,
        contact_phone = excluded.contact_phone,
        identity_source = excluded.identity_source,
        identity_confidence = excluded.identity_confidence,
        identity_updated_at = excluded.identity_updated_at,
        alert_enabled = excluded.alert_enabled,
        alert_email = excluded.alert_email,
        notes = excluded.notes
    `).bind(
      cleanVisitorId,
      now,
      now,
      label,
      contactName,
      contactCompany,
      contactEmail,
      contactPhone,
      identitySource,
      identityConfidence,
      now,
      alertEnabled,
      alertEmail,
      notes
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error('Admin visitor update error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

function isAdminAuthorized(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return token && env.ADMIN_PASSWORD && token === env.ADMIN_PASSWORD;
}

// ── PARTS REQUEST: Handle a parts-list submission ───────────
function cleanText(value, max = 500) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

function safeJson(value, max = 20000) {
  try {
    return JSON.stringify(value || null).slice(0, max);
  } catch (e) {
    return '';
  }
}

function parseMaybeJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch (e) {
    return null;
  }
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch (e) {
    return '';
  }
}

async function readJsonRequest(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

function firstString(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const joined = value.map((item) => cleanText(item, 300)).filter(Boolean).join(', ');
      if (joined) return joined;
      continue;
    }
    const text = cleanText(value, 5000);
    if (text) return text;
  }
  return '';
}

function normalizePhoneDigits(value) {
  let digits = String(value || '').replace(/\D+/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits;
}

function normalizePhoneE164(value) {
  const originalDigits = String(value || '').replace(/\D+/g, '');
  const key = normalizePhoneDigits(value);
  if (key.length === 10) return `+1${key}`;
  if (originalDigits.length >= 8 && originalDigits.length <= 15) return `+${originalDigits}`;
  return '';
}

function normalizeIsoTimestamp(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback || new Date().toISOString();
  if (typeof value === 'number' || /^\d{12,}$/.test(String(value))) {
    const d = new Date(Number(value));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const text = cleanText(value, 80);
  const d = new Date(text);
  if (!isNaN(d.getTime())) return d.toISOString();
  return fallback || new Date().toISOString();
}

function parseDurationSeconds(value) {
  if (Number.isFinite(Number(value))) return Math.max(0, Math.round(Number(value)));
  const text = String(value || '').toLowerCase();
  let total = 0;
  const hour = text.match(/(\d+(?:\.\d+)?)\s*h(?:ou)?rs?/);
  const minute = text.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/);
  const second = text.match(/(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?/);
  if (hour) total += Number(hour[1]) * 3600;
  if (minute) total += Number(minute[1]) * 60;
  if (second) total += Number(second[1]);
  return Math.max(0, Math.round(total || 0));
}

function firstAudioAttachment(raw) {
  const attachments = Array.isArray(raw.attachments) ? raw.attachments : [];
  return attachments.find((attachment) => {
    const filename = String(attachment && attachment.filename || '').toLowerCase();
    const mime = String(attachment && attachment.mime_type || attachment && attachment.mimeType || '').toLowerCase();
    return filename.endsWith('.m4a') || filename.endsWith('.mp3') || mime.startsWith('audio/');
  }) || {};
}

function normalizeCallRecord(raw) {
  const now = new Date().toISOString();
  const callerRaw = firstString(
    raw.caller_raw,
    raw.caller,
    raw.caller_number,
    raw.callerNumber,
    raw.from_number,
    raw.fromNumber,
    raw.voice_message_from
  );
  const audio = raw.audio && typeof raw.audio === 'object' ? raw.audio : firstAudioAttachment(raw);
  const transcriptRaw = firstString(
    raw.transcript_snippet,
    raw.transcriptSnippet,
    raw.transcript,
    raw.message,
    raw.transcription,
    raw.body_transcript
  );
  const noTranscript = /^\[?no transcription is available\.?\]?$/i.test(transcriptRaw);
  const createdAt = normalizeIsoTimestamp(
    raw.created_at || raw.email_ts || raw.source_email_ts || raw.date || raw.internal_date,
    now
  );

  return {
    createdAt,
    ingestedAt: now,
    updatedAt: now,
    source: cleanText(raw.source || 'talkroute_gmail', 80),
    sourceMessageId: firstString(raw.source_message_id, raw.gmail_message_id, raw.message_id, raw.id),
    sourceThreadId: firstString(raw.source_thread_id, raw.gmail_thread_id, raw.thread_id),
    sourceEmailTs: normalizeIsoTimestamp(raw.source_email_ts || raw.email_ts || raw.date || raw.internal_date, createdAt),
    sourceDisplayUrl: cleanText(raw.source_display_url || raw.gmail_display_url || raw.display_url, 700),
    emailSubject: cleanText(raw.email_subject || raw.subject, 300),
    emailFrom: cleanText(raw.email_from || raw.from_ || raw.from, 300),
    emailTo: firstString(raw.email_to, raw.to),
    callerRaw,
    callerPhoneE164: normalizePhoneE164(callerRaw),
    callerPhoneDigits: normalizePhoneDigits(callerRaw),
    mailbox: cleanText(raw.mailbox, 120),
    durationSeconds: parseDurationSeconds(raw.duration_seconds || raw.message_length || raw.duration),
    transcriptSnippet: noTranscript ? '' : makeTranscriptSnippet(transcriptRaw),
    transcriptAvailable: noTranscript || !transcriptRaw ? 0 : 1,
    audioFilename: cleanText(audio.filename || raw.audio_filename, 240),
    audioMimeType: cleanText(audio.mime_type || audio.mimeType || raw.audio_mime_type, 120),
    audioSizeBytes: Math.max(0, Math.round(Number(audio.size_bytes || audio.size || raw.audio_size_bytes || 0) || 0)),
    matchedSubmissionId: null,
    matchedVisitorId: '',
    matchStatus: 'unmatched',
    matchConfidence: '',
    matchedAt: '',
  };
}

async function findCallPhoneMatch(env, callerDigits) {
  if (!env.DB || !callerDigits) {
    return { status: 'unmatched', confidence: '', submissionId: null, visitorId: '', submission: null };
  }
  if (callerDigits.length < 10) {
    return { status: 'unmatched', confidence: '', submissionId: null, visitorId: '', submission: null };
  }

  try {
    const response = await env.DB.prepare(`
      SELECT
        id, created_at, first_name, last_name, company, email, phone, form_type,
        attribution_visitor_id, attribution_visitor_first_seen_at
      FROM submissions
      WHERE deleted = 0 AND COALESCE(phone, '') != ''
      ORDER BY created_at DESC
      LIMIT 1000
    `).all();
    const rows = response.results || [];
    for (const row of rows) {
      if (normalizePhoneDigits(row.phone) === callerDigits) {
        return {
          status: row.attribution_visitor_id ? 'matched_submission_phone' : 'matched_submission_phone_no_visitor',
          confidence: 'exact-phone',
          submissionId: Number(row.id || 0) || null,
          visitorId: cleanText(row.attribution_visitor_id, 140),
          submission: row,
        };
      }
    }
  } catch (err) {
    if (!isMissingColumnError(err) && !isMissingTableError(err)) throw err;
  }

  try {
    const response = await env.DB.prepare(`
      SELECT visitor_id, contact_phone
      FROM visitor_profiles
      WHERE COALESCE(contact_phone, '') != ''
      ORDER BY last_seen_at DESC
      LIMIT 1000
    `).all();
    const rows = response.results || [];
    for (const row of rows) {
      if (normalizePhoneDigits(row.contact_phone) === callerDigits) {
        return {
          status: 'matched_visitor_phone',
          confidence: 'exact-phone',
          submissionId: null,
          visitorId: cleanText(row.visitor_id, 140),
          submission: null,
        };
      }
    }
  } catch (err) {
    if (!isMissingColumnError(err) && !isMissingTableError(err)) throw err;
  }

  return { status: 'unmatched', confidence: '', submissionId: null, visitorId: '', submission: null };
}

async function updateVisitorIdentityFromCallMatch(env, submission, call) {
  const visitorId = cleanText(submission.attribution_visitor_id, 140);
  if (!visitorId) return;

  const contactName = [cleanText(submission.first_name, 120), cleanText(submission.last_name, 120)].filter(Boolean).join(' ');
  const contactCompany = cleanText(submission.company, 180);
  const contactEmail = cleanText(submission.email, 180).toLowerCase();
  const contactPhone = cleanText(submission.phone || call.callerRaw || call.callerPhoneE164, 80);
  const label = contactLabelFromRow({
    firstName: submission.first_name,
    lastName: submission.last_name,
    company: submission.company,
    email: submission.email,
    phone: contactPhone,
  });
  const now = call.matchedAt || new Date().toISOString();

  try {
    await env.DB.prepare(`
      INSERT INTO visitor_profiles (
        visitor_id, first_seen_at, last_seen_at,
        label, contact_name, contact_company, contact_email, contact_phone,
        identity_source, identity_confidence, identity_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(visitor_id) DO UPDATE SET
        first_seen_at = CASE WHEN visitor_profiles.first_seen_at = '' THEN excluded.first_seen_at ELSE visitor_profiles.first_seen_at END,
        last_seen_at = CASE WHEN visitor_profiles.last_seen_at = '' THEN excluded.last_seen_at ELSE visitor_profiles.last_seen_at END,
        label = CASE WHEN visitor_profiles.label = '' THEN excluded.label ELSE visitor_profiles.label END,
        contact_name = CASE WHEN excluded.contact_name != '' THEN excluded.contact_name ELSE visitor_profiles.contact_name END,
        contact_company = CASE WHEN excluded.contact_company != '' THEN excluded.contact_company ELSE visitor_profiles.contact_company END,
        contact_email = CASE WHEN excluded.contact_email != '' THEN excluded.contact_email ELSE visitor_profiles.contact_email END,
        contact_phone = CASE WHEN excluded.contact_phone != '' THEN excluded.contact_phone ELSE visitor_profiles.contact_phone END,
        identity_source = CASE
          WHEN visitor_profiles.identity_source = 'manual' THEN visitor_profiles.identity_source
          ELSE excluded.identity_source
        END,
        identity_confidence = CASE
          WHEN visitor_profiles.identity_confidence LIKE 'manual%' THEN visitor_profiles.identity_confidence
          ELSE excluded.identity_confidence
        END,
        identity_updated_at = excluded.identity_updated_at
    `).bind(
      visitorId,
      cleanText(submission.attribution_visitor_first_seen_at || submission.created_at || call.createdAt, 40),
      cleanText(submission.created_at || call.createdAt, 40),
      label,
      contactName,
      contactCompany,
      contactEmail,
      contactPhone,
      'phone+form match',
      'exact-phone-confirmed',
      now
    ).run();
  } catch (err) {
    if (!isMissingColumnError(err) && !isMissingTableError(err)) {
      console.error('Visitor phone identity update skipped:', err.message);
    }
  }
}

async function upsertCallRecord(env, call, raw) {
  const existing = await env.DB.prepare(
    `SELECT id FROM calls WHERE source = ? AND source_message_id = ?`
  ).bind(call.source, call.sourceMessageId).first();

  await env.DB.prepare(`
    INSERT INTO calls (
      created_at, ingested_at, updated_at,
      source, source_message_id, source_thread_id, source_email_ts, source_display_url,
      email_subject, email_from, email_to,
      caller_raw, caller_phone_e164, caller_phone_digits,
      mailbox, duration_seconds, transcript_snippet, transcript_available,
      audio_filename, audio_mime_type, audio_size_bytes,
      matched_submission_id, matched_visitor_id, match_status, match_confidence, matched_at,
      raw_json, deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(source, source_message_id) DO UPDATE SET
      created_at = excluded.created_at,
      ingested_at = CASE WHEN calls.ingested_at != '' THEN calls.ingested_at ELSE excluded.ingested_at END,
      updated_at = excluded.updated_at,
      source_thread_id = excluded.source_thread_id,
      source_email_ts = excluded.source_email_ts,
      source_display_url = excluded.source_display_url,
      email_subject = excluded.email_subject,
      email_from = excluded.email_from,
      email_to = excluded.email_to,
      caller_raw = excluded.caller_raw,
      caller_phone_e164 = excluded.caller_phone_e164,
      caller_phone_digits = excluded.caller_phone_digits,
      mailbox = excluded.mailbox,
      duration_seconds = excluded.duration_seconds,
      transcript_snippet = excluded.transcript_snippet,
      transcript_available = excluded.transcript_available,
      audio_filename = excluded.audio_filename,
      audio_mime_type = excluded.audio_mime_type,
      audio_size_bytes = excluded.audio_size_bytes,
      matched_submission_id = excluded.matched_submission_id,
      matched_visitor_id = excluded.matched_visitor_id,
      match_status = excluded.match_status,
      match_confidence = excluded.match_confidence,
      matched_at = excluded.matched_at,
      raw_json = excluded.raw_json,
      deleted = 0
  `).bind(
    call.createdAt,
    call.ingestedAt,
    call.updatedAt,
    call.source,
    call.sourceMessageId,
    call.sourceThreadId,
    call.sourceEmailTs,
    call.sourceDisplayUrl,
    call.emailSubject,
    call.emailFrom,
    call.emailTo,
    call.callerRaw,
    call.callerPhoneE164,
    call.callerPhoneDigits,
    call.mailbox,
    call.durationSeconds,
    call.transcriptSnippet,
    call.transcriptAvailable,
    call.audioFilename,
    call.audioMimeType,
    call.audioSizeBytes,
    call.matchedSubmissionId,
    call.matchedVisitorId,
    call.matchStatus,
    call.matchConfidence,
    call.matchedAt,
    safeJson(callRawMetadata(raw, call), 3000)
  ).run();

  const row = await env.DB.prepare(
    `SELECT id FROM calls WHERE source = ? AND source_message_id = ?`
  ).bind(call.source, call.sourceMessageId).first();
  return { existed: Boolean(existing), id: row?.id || existing?.id || null };
}

function makeTranscriptSnippet(value) {
  const text = cleanText(value, 1000);
  if (!text) return '';
  return text.length > 200 ? `${text.slice(0, 197).trim()}...` : text;
}

function callRawMetadata(raw, call) {
  return {
    source: call.source,
    message_id: call.sourceMessageId,
    thread_id: call.sourceThreadId,
    from: call.emailFrom,
    subject: call.emailSubject,
    message_length: call.durationSeconds,
    mailbox: call.mailbox,
    source_email_ts: call.sourceEmailTs,
    created_at: call.createdAt,
    ingested_at: call.ingestedAt,
    updated_at: call.updatedAt,
    raw_message_size: Math.max(0, Math.round(Number(raw.raw_message_size || raw.sizeEstimate || raw.size_estimate || 0) || 0)),
  };
}

function normalizePages(pages) {
  if (!Array.isArray(pages)) return [];
  return pages.slice(-20).map((page) => ({
    at: cleanText(page && page.at, 40),
    path: cleanText(page && page.path, 700),
    title: cleanText(page && page.title, 200),
    referrer: cleanText(page && page.referrer, 700),
  })).filter((page) => page.path || page.title);
}

function normalizeAttribution(raw, defaultFormName = 'unknown_form') {
  const data = parseMaybeJson(raw) || {};
  const pages = normalizePages(data.pages);
  const attribution = {
    formName: cleanText(data.form_name || defaultFormName, 100),
    visitorId: cleanText(data.visitor_id, 140),
    visitorFirstSeenAt: cleanText(data.visitor_first_seen_at, 40),
    visitorLastSeenAt: cleanText(data.visitor_last_seen_at, 40),
    visitorVisitCount: Number.isFinite(Number(data.visitor_visit_count)) ? Number(data.visitor_visit_count) : 0,
    visitorIsReturning: Number(data.visitor_is_returning) ? 1 : 0,
    sessionId: cleanText(data.session_id, 120),
    firstTouchId: cleanText(data.first_touch_id, 120),
    landingPage: cleanText(data.landing_page, 700),
    currentPage: cleanText(data.current_page, 700),
    referrer: cleanText(data.referrer, 700),
    source: cleanText(data.source, 120),
    medium: cleanText(data.medium, 120),
    campaign: cleanText(data.campaign, 160),
    term: cleanText(data.term, 180),
    content: cleanText(data.content, 180),
    gclid: cleanText(data.gclid, 250),
    gbraid: cleanText(data.gbraid, 250),
    wbraid: cleanText(data.wbraid, 250),
    msclkid: cleanText(data.msclkid, 250),
    gaClientId: cleanText(data.ga_client_id, 120),
    gaSessionId: cleanText(data.ga_session_id, 120),
    statcounterVisitorId: cleanText(data.statcounter_visitor_id, 120),
    firstSeenAt: cleanText(data.first_seen_at, 40),
    formStartedAt: cleanText(data.form_started_at, 40),
    formSubmittedAt: cleanText(data.form_submitted_at, 40),
    pageCount: Number.isFinite(Number(data.page_count)) ? Number(data.page_count) : pages.length,
    pages,
    rawJson: safeJson(data, 20000),
  };

  if (!attribution.source && attribution.gclid) {
    attribution.source = 'google';
    attribution.medium = 'cpc';
  }
  if (!attribution.source) attribution.source = 'unknown';
  if (!attribution.medium) attribution.medium = 'unknown';
  if (attribution.pageCount < pages.length) attribution.pageCount = pages.length;

  return attribution;
}

function firstHeaderValue(value) {
  return cleanText(String(value || '').split(',')[0], 120);
}

function normalizeVisitorContext(raw) {
  const data = raw || {};
  return {
    ip: cleanText(data.ip, 80),
    userAgent: cleanText(data.userAgent, 1000),
    acceptLanguage: cleanText(data.acceptLanguage, 300),
    country: cleanText(data.country, 80),
    region: cleanText(data.region, 120),
    city: cleanText(data.city, 120),
    timezone: cleanText(data.timezone, 80),
    asn: cleanText(data.asn, 40),
    asOrganization: cleanText(data.asOrganization, 200),
    cfRay: cleanText(data.cfRay, 120),
  };
}

function getVisitorContext(request) {
  const cf = request.cf || {};
  return normalizeVisitorContext({
    ip: request.headers.get('CF-Connecting-IP')
      || firstHeaderValue(request.headers.get('X-Forwarded-For'))
      || '',
    userAgent: request.headers.get('User-Agent') || '',
    acceptLanguage: request.headers.get('Accept-Language') || '',
    country: cf.country || request.headers.get('CF-IPCountry') || '',
    region: cf.region || cf.regionCode || '',
    city: cf.city || '',
    timezone: cf.timezone || '',
    asn: cf.asn || '',
    asOrganization: cf.asOrganization || '',
    cfRay: request.headers.get('CF-Ray') || '',
  });
}

async function handlePageview(request, env, ctx) {
  let body = {};
  try {
    body = await readJsonRequest(request);
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  const attribution = normalizeAttribution(body.attribution || body, 'pageview');
  const page = body.page && typeof body.page === 'object' ? body.page : {};
  const visitorContext = getVisitorContext(request);

  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(recordVisitorPageview(env, attribution, visitorContext, page));
  } else {
    await recordVisitorPageview(env, attribution, visitorContext, page);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: CORS_HEADERS,
  });
}

async function handleVisitorEvent(request, env, ctx) {
  let body = {};
  try {
    body = await readJsonRequest(request);
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  const eventType = cleanText(body.event_type, 40);
  if (eventType !== 'phone_click' && eventType !== 'email_click') {
    return new Response(JSON.stringify({ success: false, error: 'Unsupported event_type' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  const attribution = normalizeAttribution(body.attribution || {}, eventType);
  const page = body.page && typeof body.page === 'object' ? body.page : {};
  const target = cleanText(body.target, 220);
  const linkText = cleanText(body.link_text, 220);
  const visitorContext = getVisitorContext(request);

  if (!attribution.visitorId || !attribution.sessionId) {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(recordVisitorIntentEvent(env, eventType, target, linkText, attribution, visitorContext, page));
  } else {
    await recordVisitorIntentEvent(env, eventType, target, linkText, attribution, visitorContext, page);
  }

  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

async function recordVisitorIntentEvent(env, eventType, target, linkText, attribution, visitor, page) {
  if (!env.DB || !attribution.visitorId) return;

  const now = new Date().toISOString();
  const pagePath = cleanText((page && page.path) || attribution.currentPage || attribution.landingPage, 700);
  const pageTitle = cleanText((page && page.title) || '', 200);
  const attributionJson = safeJson({ target, link_text: linkText }, 2000);

  try {
    await env.DB.prepare(`
      INSERT INTO visitor_events (
        created_at, visitor_id, session_id, event_type,
        page_path, page_title, referrer,
        source, medium, campaign, term,
        visitor_ip, visitor_country, visitor_region, visitor_city,
        attribution_json, visitor_context_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      now,
      attribution.visitorId,
      attribution.sessionId,
      eventType,
      pagePath,
      pageTitle,
      attribution.referrer,
      attribution.source,
      attribution.medium,
      attribution.campaign,
      attribution.term,
      visitor.ip,
      visitor.country,
      visitor.region,
      visitor.city,
      attributionJson,
      safeJson(visitor, 4000)
    ).run();

    await env.DB.prepare(`
      INSERT INTO visitor_profiles (
        visitor_id, first_seen_at, last_seen_at, last_session_id,
        first_landing_page, last_page, last_title, referrer,
        source, medium, campaign, term,
        gclid, gbraid, wbraid, ga_client_id, statcounter_visitor_id,
        visitor_ip, visitor_user_agent, visitor_country, visitor_region, visitor_city,
        visitor_timezone, visitor_asn, visitor_as_organization,
        visit_count, pageview_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(visitor_id) DO UPDATE SET
        last_seen_at = excluded.last_seen_at,
        last_session_id = CASE WHEN excluded.last_session_id != '' THEN excluded.last_session_id ELSE visitor_profiles.last_session_id END,
        last_page = CASE WHEN excluded.last_page != '' THEN excluded.last_page ELSE visitor_profiles.last_page END,
        last_title = CASE WHEN excluded.last_title != '' THEN excluded.last_title ELSE visitor_profiles.last_title END,
        source = CASE WHEN visitor_profiles.source = '' THEN excluded.source ELSE visitor_profiles.source END,
        medium = CASE WHEN visitor_profiles.medium = '' THEN excluded.medium ELSE visitor_profiles.medium END,
        campaign = CASE WHEN visitor_profiles.campaign = '' THEN excluded.campaign ELSE visitor_profiles.campaign END,
        term = CASE WHEN visitor_profiles.term = '' THEN excluded.term ELSE visitor_profiles.term END,
        gclid = CASE WHEN excluded.gclid != '' THEN excluded.gclid ELSE visitor_profiles.gclid END,
        gbraid = CASE WHEN excluded.gbraid != '' THEN excluded.gbraid ELSE visitor_profiles.gbraid END,
        wbraid = CASE WHEN excluded.wbraid != '' THEN excluded.wbraid ELSE visitor_profiles.wbraid END,
        ga_client_id = CASE WHEN excluded.ga_client_id != '' THEN excluded.ga_client_id ELSE visitor_profiles.ga_client_id END,
        statcounter_visitor_id = CASE WHEN excluded.statcounter_visitor_id != '' THEN excluded.statcounter_visitor_id ELSE visitor_profiles.statcounter_visitor_id END,
        visitor_ip = CASE WHEN excluded.visitor_ip != '' THEN excluded.visitor_ip ELSE visitor_profiles.visitor_ip END,
        visitor_user_agent = CASE WHEN excluded.visitor_user_agent != '' THEN excluded.visitor_user_agent ELSE visitor_profiles.visitor_user_agent END,
        visitor_country = CASE WHEN excluded.visitor_country != '' THEN excluded.visitor_country ELSE visitor_profiles.visitor_country END,
        visitor_region = CASE WHEN excluded.visitor_region != '' THEN excluded.visitor_region ELSE visitor_profiles.visitor_region END,
        visitor_city = CASE WHEN excluded.visitor_city != '' THEN excluded.visitor_city ELSE visitor_profiles.visitor_city END,
        visitor_timezone = CASE WHEN excluded.visitor_timezone != '' THEN excluded.visitor_timezone ELSE visitor_profiles.visitor_timezone END,
        visitor_asn = CASE WHEN excluded.visitor_asn != '' THEN excluded.visitor_asn ELSE visitor_profiles.visitor_asn END,
        visitor_as_organization = CASE WHEN excluded.visitor_as_organization != '' THEN excluded.visitor_as_organization ELSE visitor_profiles.visitor_as_organization END,
        visit_count = CASE WHEN excluded.visit_count > visitor_profiles.visit_count THEN excluded.visit_count ELSE visitor_profiles.visit_count END
    `).bind(
      attribution.visitorId,
      attribution.visitorFirstSeenAt || now,
      now,
      attribution.sessionId,
      attribution.landingPage,
      pagePath,
      pageTitle,
      attribution.referrer,
      attribution.source,
      attribution.medium,
      attribution.campaign,
      attribution.term,
      attribution.gclid,
      attribution.gbraid,
      attribution.wbraid,
      attribution.gaClientId,
      attribution.statcounterVisitorId,
      visitor.ip,
      visitor.userAgent,
      visitor.country,
      visitor.region,
      visitor.city,
      visitor.timezone,
      visitor.asn,
      visitor.asOrganization,
      attribution.visitorVisitCount,
      0
    ).run();
  } catch (err) {
    if (!isMissingColumnError(err) && !isMissingTableError(err)) {
      console.error('Visitor intent event error:', err.message);
    }
  }
}

async function recordVisitorPageview(env, attribution, visitor, page) {
  if (!env.DB || !attribution.visitorId) return;

  const now = new Date().toISOString();
  const pagePath = cleanText((page && page.path) || attribution.currentPage || attribution.landingPage, 700);
  const pageTitle = cleanText((page && page.title) || '', 200);
  const existing = await getVisitorProfile(env, attribution.visitorId);
  const previousSessionId = existing && existing.last_session_id ? existing.last_session_id : '';
  const isNewSession = Boolean(previousSessionId && previousSessionId !== attribution.sessionId);

  try {
    await env.DB.prepare(`
      INSERT INTO visitor_events (
        created_at, visitor_id, session_id, event_type,
        page_path, page_title, referrer,
        source, medium, campaign, term,
        visitor_ip, visitor_country, visitor_region, visitor_city,
        attribution_json, visitor_context_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      now,
      attribution.visitorId,
      attribution.sessionId,
      'pageview',
      pagePath,
      pageTitle,
      attribution.referrer,
      attribution.source,
      attribution.medium,
      attribution.campaign,
      attribution.term,
      visitor.ip,
      visitor.country,
      visitor.region,
      visitor.city,
      safeJson(attribution, 12000),
      safeJson(visitor, 4000)
    ).run();

    await env.DB.prepare(`
      INSERT INTO visitor_profiles (
        visitor_id, first_seen_at, last_seen_at, last_session_id,
        first_landing_page, last_page, last_title, referrer,
        source, medium, campaign, term,
        gclid, gbraid, wbraid, ga_client_id, statcounter_visitor_id,
        visitor_ip, visitor_user_agent, visitor_country, visitor_region, visitor_city,
        visitor_timezone, visitor_asn, visitor_as_organization,
        visit_count, pageview_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(visitor_id) DO UPDATE SET
        last_seen_at = excluded.last_seen_at,
        last_session_id = excluded.last_session_id,
        last_page = excluded.last_page,
        last_title = excluded.last_title,
        referrer = excluded.referrer,
        source = excluded.source,
        medium = excluded.medium,
        campaign = excluded.campaign,
        term = excluded.term,
        gclid = CASE WHEN excluded.gclid != '' THEN excluded.gclid ELSE visitor_profiles.gclid END,
        gbraid = CASE WHEN excluded.gbraid != '' THEN excluded.gbraid ELSE visitor_profiles.gbraid END,
        wbraid = CASE WHEN excluded.wbraid != '' THEN excluded.wbraid ELSE visitor_profiles.wbraid END,
        ga_client_id = CASE WHEN excluded.ga_client_id != '' THEN excluded.ga_client_id ELSE visitor_profiles.ga_client_id END,
        statcounter_visitor_id = CASE WHEN excluded.statcounter_visitor_id != '' THEN excluded.statcounter_visitor_id ELSE visitor_profiles.statcounter_visitor_id END,
        visitor_ip = excluded.visitor_ip,
        visitor_user_agent = excluded.visitor_user_agent,
        visitor_country = excluded.visitor_country,
        visitor_region = excluded.visitor_region,
        visitor_city = excluded.visitor_city,
        visitor_timezone = excluded.visitor_timezone,
        visitor_asn = excluded.visitor_asn,
        visitor_as_organization = excluded.visitor_as_organization,
        visit_count = CASE WHEN excluded.visit_count > visitor_profiles.visit_count THEN excluded.visit_count ELSE visitor_profiles.visit_count END,
        pageview_count = visitor_profiles.pageview_count + 1
    `).bind(
      attribution.visitorId,
      attribution.visitorFirstSeenAt || now,
      now,
      attribution.sessionId,
      attribution.landingPage,
      pagePath,
      pageTitle,
      attribution.referrer,
      attribution.source,
      attribution.medium,
      attribution.campaign,
      attribution.term,
      attribution.gclid,
      attribution.gbraid,
      attribution.wbraid,
      attribution.gaClientId,
      attribution.statcounterVisitorId,
      visitor.ip,
      visitor.userAgent,
      visitor.country,
      visitor.region,
      visitor.city,
      visitor.timezone,
      visitor.asn,
      visitor.asOrganization,
      attribution.visitorVisitCount,
      1
    ).run();

    if (existing && Number(existing.alert_enabled) && isNewSession && existing.last_alerted_session_id !== attribution.sessionId) {
      await sendVisitorReturnAlert(env, existing, attribution, visitor, pagePath, pageTitle);
      await env.DB.prepare(`
        UPDATE visitor_profiles
        SET last_alerted_session_id = ?
        WHERE visitor_id = ?
      `).bind(attribution.sessionId, attribution.visitorId).run();
    }
  } catch (err) {
    if (!isMissingColumnError(err)) {
      console.error('Visitor pageview error:', err.message);
    }
  }
}

async function getVisitorProfile(env, visitorId) {
  try {
    return await env.DB.prepare(`
      SELECT *
      FROM visitor_profiles
      WHERE visitor_id = ?
    `).bind(visitorId).first();
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;
    return null;
  }
}

async function sendVisitorReturnAlert(env, profile, attribution, visitor, pagePath, pageTitle) {
  if (!env.RESEND_API_KEY) return;
  const label = profile.label || 'Labeled visitor';
  const to = profile.alert_email || 'sales@dolphincentrifuge.com';
  const currentPageUrl = absoluteSiteUrl(pagePath);
  const currentPageLabel = pageTitle ? `${pagePath} (${pageTitle})` : pagePath;
  const dashboardUrl = adminDashboardUrl(env, attribution.visitorId);
  const sessionTrail = buildAttributionPageTrail(attribution, pagePath, pageTitle);
  const recentEvents = await getRecentVisitorEvents(env, attribution.visitorId);
  const recentKnownTrail = recentEvents.map((event) => ({
    at: event.created_at || '',
    path: event.page_path || '',
    title: event.page_title || '',
  })).filter((event) => event.path || event.title);
  const location = [visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ');
  const network = [visitor.asn ? `AS${visitor.asn}` : '', visitor.asOrganization].filter(Boolean).join(' ');
  const sourceMedium = [attribution.source, attribution.medium].filter(Boolean).join(' / ');
  const firstSeen = profile.first_seen_at || attribution.visitorFirstSeenAt || attribution.firstSeenAt || '';
  const previousSeen = profile.last_seen_at || attribution.visitorLastSeenAt || '';
  const visitCount = attribution.visitorVisitCount || profile.visit_count || '';
  const pageviewCount = profile.pageview_count ? Number(profile.pageview_count) + 1 : '';
  const googleClickId = attribution.gclid ? 'Present' : '';
  const subjectPage = pageTitle || pagePath || 'site';
  const subject = `Dolphin alert: ${label} returned`;
  const summaryRows = [
    ['Visitor label', label],
    ['Visitor ID', attribution.visitorId],
    ['Visit count', visitCount],
    ['Known pageviews', pageviewCount],
    ['First seen', formatAlertTime(firstSeen)],
    ['Previous seen', formatAlertTime(previousSeen)],
    ['Current session', attribution.sessionId],
  ];
  const attributionRows = [
    ['Source / medium', sourceMedium],
    ['Campaign', attribution.campaign],
    ['Keyword', attribution.term],
    ['Google Ads click ID', googleClickId],
    ['GA client ID', attribution.gaClientId],
    ['StatCounter visitor ID', attribution.statcounterVisitorId],
    ['Landing page', attribution.landingPage],
    ['Referrer', attribution.referrer],
  ];
  const visitorRows = [
    ['IP address', visitor.ip],
    ['Location', location],
    ['Network', network],
    ['Language', visitor.acceptLanguage],
    ['Browser', summarizeUserAgent(visitor.userAgent)],
    ['CF-Ray', visitor.cfRay],
  ];
  const text = [
    `Dolphin visitor returned: ${label}`,
    '',
    `Just visited: ${subjectPage}`,
    currentPageUrl ? `URL: ${currentPageUrl}` : '',
    '',
    'Visitor:',
    ...summaryRows.filter((row) => row[1]).map((row) => `${row[0]}: ${row[1]}`),
    '',
    'Attribution:',
    ...attributionRows.filter((row) => row[1]).map((row) => `${row[0]}: ${row[1]}`),
    '',
    'Visitor context:',
    ...visitorRows.filter((row) => row[1]).map((row) => `${row[0]}: ${row[1]}`),
    '',
    'This visit so far:',
    ...formatTextTrail(sessionTrail),
    '',
    'Recent known pages:',
    ...formatTextTrail(recentKnownTrail),
    '',
    `Dashboard: ${dashboardUrl}`,
  ].filter((line) => line !== '').join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:760px;line-height:1.45;">
      <div style="border-bottom:4px solid #c9a45c;padding-bottom:12px;margin-bottom:18px;">
        <p style="margin:0 0 4px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.04em;">Dolphin first-party visitor alert</p>
        <h2 style="color:#0a2540;margin:0;font-size:24px;">${esc(label)} returned</h2>
      </div>

      <div style="background:#f8fafc;border:1px solid #d9e2ec;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
        <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Just visited</p>
        <p style="margin:0;font-size:18px;font-weight:bold;color:#0a2540;">${esc(pageTitle || pagePath || 'Unknown page')}</p>
        ${currentPageUrl ? `<p style="margin:6px 0 0;"><a href="${esc(currentPageUrl)}" style="color:#145c9e;">${esc(currentPageLabel)}</a></p>` : ''}
      </div>

      ${renderAlertTable('Visitor', summaryRows)}
      ${renderTrailSection('This visit so far', sessionTrail)}
      ${renderTrailSection('Recent known pages', recentKnownTrail)}
      ${renderAlertTable('Google and attribution', attributionRows)}
      ${renderAlertTable('Visitor context', visitorRows)}

      <p style="margin:24px 0 8px;">
        <a href="${esc(dashboardUrl)}" style="display:inline-block;background:#0a2540;color:#fff;text-decoration:none;padding:11px 16px;border-radius:6px;font-weight:bold;">Open dashboard filtered to this visitor</a>
      </p>
      <p style="font-size:12px;color:#64748b;margin-top:18px;">This alert came from Dolphin first-party visitor tracking. StatCounter sends a link; this email includes the useful context directly.</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Dolphin Visitor Alerts <noreply@dolphincentrifuge.com>',
      to: [to],
      subject,
      text,
      html,
    }),
  });
  if (!response.ok) {
    console.error('Visitor alert email error:', await response.text());
  }
}

async function getRecentVisitorEvents(env, visitorId) {
  if (!env.DB || !visitorId) return [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT created_at, page_path, page_title
      FROM visitor_events
      WHERE visitor_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(visitorId).all();
    return results || [];
  } catch (err) {
    if (!isMissingColumnError(err)) {
      console.error('Visitor event trail error:', err.message);
    }
    return [];
  }
}

function adminDashboardUrl(env, visitorId) {
  const fallback = 'https://dolphincentrifuge.com/admin/submissions/';
  const rawBase = cleanText(env.ADMIN_DASHBOARD_URL || env.DASHBOARD_URL || fallback, 700);
  try {
    const url = new URL(rawBase || fallback);
    if (visitorId) url.searchParams.set('q', visitorId);
    return url.href;
  } catch (e) {
    return `${fallback}?q=${encodeURIComponent(visitorId || '')}`;
  }
}

function absoluteSiteUrl(pathOrUrl) {
  const value = cleanText(pathOrUrl, 700);
  if (!value) return '';
  try {
    return new URL(value, 'https://dolphincentrifuge.com').href;
  } catch (e) {
    return '';
  }
}

function formatAlertTime(value) {
  const clean = cleanText(value, 80);
  if (!clean) return '';
  const date = new Date(clean);
  if (Number.isNaN(date.getTime())) return clean;
  return date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

function summarizeUserAgent(userAgent) {
  const ua = cleanText(userAgent, 300);
  if (!ua) return '';
  const browser = ua.includes('Edg/') ? 'Edge'
    : ua.includes('Chrome/') ? 'Chrome'
      : ua.includes('Firefox/') ? 'Firefox'
        : ua.includes('Safari/') ? 'Safari'
          : 'Browser';
  const os = ua.includes('Windows') ? 'Windows'
    : ua.includes('Mac OS X') ? 'macOS'
      : ua.includes('Android') ? 'Android'
        : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS'
          : '';
  return [browser, os].filter(Boolean).join(' on ') || ua.slice(0, 120);
}

function buildAttributionPageTrail(attribution, pagePath, pageTitle) {
  const pages = Array.isArray(attribution.pages) ? attribution.pages.slice(-8) : [];
  const current = {
    at: new Date().toISOString(),
    path: pagePath || attribution.currentPage || '',
    title: pageTitle || '',
  };
  const trail = pages.concat(current).filter((page) => page.path || page.title);
  const deduped = [];
  for (const page of trail) {
    const previous = deduped[deduped.length - 1];
    if (previous && previous.path === page.path && previous.title === page.title) continue;
    deduped.push(page);
  }
  return deduped.slice(-8);
}

function renderAlertTable(title, rows) {
  const visibleRows = rows.filter((row) => row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== '');
  if (!visibleRows.length) return '';
  const body = visibleRows.map((row) => `
    <tr>
      <th style="text-align:left;vertical-align:top;width:170px;padding:7px 9px;border:1px solid #d9e2ec;background:#f8fafc;color:#475569;font-weight:600;">${esc(row[0])}</th>
      <td style="padding:7px 9px;border:1px solid #d9e2ec;color:#1f2937;">${esc(row[1])}</td>
    </tr>
  `).join('');
  return `
    <h3 style="margin:20px 0 8px;color:#0a2540;font-size:16px;">${esc(title)}</h3>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">${body}</table>
  `;
}

function renderTrailSection(title, pages) {
  const visiblePages = (Array.isArray(pages) ? pages : []).filter((page) => page.path || page.title).slice(0, 10);
  if (!visiblePages.length) return '';
  const items = visiblePages.map((page) => {
    const url = absoluteSiteUrl(page.path);
    const label = page.title ? `${page.path || ''} (${page.title})` : page.path;
    const when = formatAlertTime(page.at || page.created_at || '');
    return `
      <li style="margin:0 0 8px;">
        ${url ? `<a href="${esc(url)}" style="color:#145c9e;">${esc(label || url)}</a>` : esc(label)}
        ${when ? `<div style="font-size:12px;color:#64748b;">${esc(when)}</div>` : ''}
      </li>
    `;
  }).join('');
  return `
    <h3 style="margin:20px 0 8px;color:#0a2540;font-size:16px;">${esc(title)}</h3>
    <ol style="margin:0 0 0 22px;padding:0;font-size:14px;">${items}</ol>
  `;
}

function formatTextTrail(pages) {
  const visiblePages = (Array.isArray(pages) ? pages : []).filter((page) => page.path || page.title).slice(0, 10);
  if (!visiblePages.length) return ['No page trail available yet.'];
  return visiblePages.map((page, index) => {
    const label = page.title ? `${page.path || ''} (${page.title})` : page.path;
    const when = formatAlertTime(page.at || page.created_at || '');
    return `${index + 1}. ${label}${when ? ` at ${when}` : ''}`;
  });
}

function isMissingColumnError(err) {
  const message = err && err.message ? String(err.message).toLowerCase() : '';
  return message.includes('no such column') || message.includes('has no column named');
}

// A whole table (not just a column) being absent — used by best-effort read paths
// (e.g. the summary KPIs) that should degrade to 0 rather than 500 on a fresh DB.
function isMissingTableError(err) {
  const message = err && err.message ? String(err.message).toLowerCase() : '';
  return message.includes('no such table');
}

function splitName(fullName) {
  const parts = cleanText(fullName, 200).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

function contactLabelFromRow(row) {
  const name = [cleanText(row.firstName, 120), cleanText(row.lastName, 120)].filter(Boolean).join(' ');
  const company = cleanText(row.company, 180);
  const email = cleanText(row.email, 180);
  const phone = cleanText(row.phone, 80);
  if (name && company) return `${name} - ${company}`.slice(0, 160);
  return (name || company || email || phone || '').slice(0, 160);
}

async function updateVisitorIdentityFromSubmission(env, row, attribution, createdAt) {
  if (!attribution || !attribution.visitorId) return;

  const contactName = [cleanText(row.firstName, 120), cleanText(row.lastName, 120)].filter(Boolean).join(' ');
  const contactCompany = cleanText(row.company, 180);
  const contactEmail = cleanText(row.email, 180).toLowerCase();
  const contactPhone = cleanText(row.phone, 80);
  const label = contactLabelFromRow(row);

  if (!contactName && !contactCompany && !contactEmail && !contactPhone && !label) return;

  const now = createdAt || new Date().toISOString();
  const source = cleanText(`form:${row.formType || attribution.formName || 'contact'}`, 80);

  try {
    await env.DB.prepare(`
      INSERT INTO visitor_profiles (
        visitor_id, first_seen_at, last_seen_at,
        label, contact_name, contact_company, contact_email, contact_phone,
        identity_source, identity_confidence, identity_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(visitor_id) DO UPDATE SET
        label = CASE WHEN visitor_profiles.label = '' THEN excluded.label ELSE visitor_profiles.label END,
        contact_name = CASE WHEN excluded.contact_name != '' THEN excluded.contact_name ELSE visitor_profiles.contact_name END,
        contact_company = CASE WHEN excluded.contact_company != '' THEN excluded.contact_company ELSE visitor_profiles.contact_company END,
        contact_email = CASE WHEN excluded.contact_email != '' THEN excluded.contact_email ELSE visitor_profiles.contact_email END,
        contact_phone = CASE WHEN excluded.contact_phone != '' THEN excluded.contact_phone ELSE visitor_profiles.contact_phone END,
        identity_source = CASE
          WHEN visitor_profiles.identity_source = 'manual' THEN visitor_profiles.identity_source
          ELSE excluded.identity_source
        END,
        identity_confidence = CASE
          WHEN visitor_profiles.identity_confidence = 'manual-confirmed' THEN visitor_profiles.identity_confidence
          ELSE excluded.identity_confidence
        END,
        identity_updated_at = excluded.identity_updated_at
    `).bind(
      attribution.visitorId,
      attribution.visitorFirstSeenAt || now,
      now,
      label,
      contactName,
      contactCompany,
      contactEmail,
      contactPhone,
      source,
      'form-confirmed',
      now
    ).run();
  } catch (err) {
    console.error('Visitor identity update skipped:', err.message);
  }
}

async function insertSubmission(env, row) {
  const attribution = row.attribution || normalizeAttribution(null, row.formType || 'contact');
  const visitor = normalizeVisitorContext(row.visitorContext);
  const createdAt = row.createdAt || new Date().toISOString();
  const baseValues = [
    createdAt,
    cleanText(row.firstName, 120),
    cleanText(row.lastName, 120),
    cleanText(row.company, 180),
    cleanText(row.email, 180),
    cleanText(row.phone, 80),
    cleanText(row.contactMethod, 80),
    cleanText(row.country, 120),
    cleanText(row.usState, 120),
    cleanText(row.fluidType, 180),
    cleanText(row.capacity, 180),
    cleanText(row.solidsPercentage, 120),
    cleanText(row.centrifugeCondition, 120),
    cleanText(row.additionalDetails, 5000),
    row.isReconnect ? 1 : 0,
    row.reconnectMatchId || null,
  ];

  try {
    const result = await env.DB.prepare(`
      INSERT INTO submissions (
        created_at, first_name, last_name, company, email, phone,
        contact_method, country, us_state,
        fluid_type, capacity, solids_percentage,
        centrifuge_condition, additional_details,
        is_reconnect, reconnect_match_id,
        form_type,
        attribution_session_id, attribution_first_touch_id,
        attribution_visitor_id, attribution_visitor_first_seen_at, attribution_visitor_last_seen_at,
        attribution_visit_count, attribution_is_returning,
        attribution_landing_page, attribution_current_page, attribution_referrer,
        attribution_source, attribution_medium, attribution_campaign, attribution_term, attribution_content,
        attribution_gclid, attribution_gbraid, attribution_wbraid, attribution_msclkid,
        attribution_ga_client_id, attribution_ga_session_id, attribution_statcounter_visitor_id,
        attribution_first_seen_at, attribution_form_started_at, attribution_form_submitted_at,
        attribution_page_count, attribution_pages_json, attribution_raw_json,
        parts_json, parts_count,
        visitor_ip, visitor_user_agent, visitor_accept_language,
        visitor_country, visitor_region, visitor_city, visitor_timezone,
        visitor_asn, visitor_as_organization, visitor_cf_ray
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?,
        ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `).bind(
      ...baseValues,
      cleanText(row.formType || attribution.formName || 'contact', 100),
      attribution.sessionId,
      attribution.firstTouchId,
      attribution.visitorId,
      attribution.visitorFirstSeenAt,
      attribution.visitorLastSeenAt,
      attribution.visitorVisitCount,
      attribution.visitorIsReturning,
      attribution.landingPage,
      attribution.currentPage,
      attribution.referrer,
      attribution.source,
      attribution.medium,
      attribution.campaign,
      attribution.term,
      attribution.content,
      attribution.gclid,
      attribution.gbraid,
      attribution.wbraid,
      attribution.msclkid,
      attribution.gaClientId,
      attribution.gaSessionId,
      attribution.statcounterVisitorId,
      attribution.firstSeenAt,
      attribution.formStartedAt,
      attribution.formSubmittedAt,
      attribution.pageCount,
      safeJson(attribution.pages, 12000),
      attribution.rawJson,
      cleanText(row.partsJson, 10000),
      Number.isFinite(Number(row.partsCount)) ? Number(row.partsCount) : 0,
      visitor.ip,
      visitor.userAgent,
      visitor.acceptLanguage,
      visitor.country,
      visitor.region,
      visitor.city,
      visitor.timezone,
      visitor.asn,
      visitor.asOrganization,
      visitor.cfRay
    ).run();
    await updateVisitorIdentityFromSubmission(env, row, attribution, createdAt);
    return result;
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;

    try {
      return await env.DB.prepare(`
        INSERT INTO submissions (
          created_at, first_name, last_name, company, email, phone,
          contact_method, country, us_state,
          fluid_type, capacity, solids_percentage,
          centrifuge_condition, additional_details,
          is_reconnect, reconnect_match_id,
          form_type,
          attribution_session_id, attribution_first_touch_id,
          attribution_landing_page, attribution_current_page, attribution_referrer,
          attribution_source, attribution_medium, attribution_campaign, attribution_term, attribution_content,
          attribution_gclid, attribution_gbraid, attribution_wbraid, attribution_msclkid,
          attribution_ga_client_id, attribution_ga_session_id, attribution_statcounter_visitor_id,
          attribution_first_seen_at, attribution_form_started_at, attribution_form_submitted_at,
          attribution_page_count, attribution_pages_json, attribution_raw_json,
          parts_json, parts_count
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?,
          ?, ?,
          ?,
          ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?
        )
      `).bind(
        ...baseValues,
        cleanText(row.formType || attribution.formName || 'contact', 100),
        attribution.sessionId,
        attribution.firstTouchId,
        attribution.landingPage,
        attribution.currentPage,
        attribution.referrer,
        attribution.source,
        attribution.medium,
        attribution.campaign,
        attribution.term,
        attribution.content,
        attribution.gclid,
        attribution.gbraid,
        attribution.wbraid,
        attribution.msclkid,
        attribution.gaClientId,
        attribution.gaSessionId,
        attribution.statcounterVisitorId,
        attribution.firstSeenAt,
        attribution.formStartedAt,
        attribution.formSubmittedAt,
        attribution.pageCount,
        safeJson(attribution.pages, 12000),
        attribution.rawJson,
        cleanText(row.partsJson, 10000),
        Number.isFinite(Number(row.partsCount)) ? Number(row.partsCount) : 0
      ).run();
    } catch (fallbackErr) {
      if (!isMissingColumnError(fallbackErr)) throw fallbackErr;
    }

    try {
      return await env.DB.prepare(`
        INSERT INTO submissions (
          created_at, first_name, last_name, company, email, phone,
          contact_method, country, us_state,
          fluid_type, capacity, solids_percentage,
          centrifuge_condition, additional_details,
          is_reconnect, reconnect_match_id,
          form_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        ...baseValues,
        cleanText(row.formType || attribution.formName || 'contact', 100)
      ).run();
    } catch (formTypeErr) {
      if (!isMissingColumnError(formTypeErr)) throw formTypeErr;
      // Absolute last resort: original base columns only (form_type column truly absent).
      return env.DB.prepare(`
        INSERT INTO submissions (
          created_at, first_name, last_name, company, email, phone,
          contact_method, country, us_state,
          fluid_type, capacity, solids_percentage,
          centrifuge_condition, additional_details,
          is_reconnect, reconnect_match_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(...baseValues).run();
    }
  }
}

async function handlePartsSubmit(request, env) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Honeypot spam check
    if (body['bot-field']) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot detected' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Optional Turnstile verification (mirrors handleFormSubmit pattern)
    const turnstileToken = body['cf-turnstile-response'];
    if (turnstileToken && env.TURNSTILE_SECRET_KEY) {
      let verified = true;
      try {
        verified = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, request);
      } catch (turnstileErr) {
        console.error('Turnstile verification infrastructure error (parts):', turnstileErr && turnstileErr.message);
      }
      if (!verified) {
        return new Response(
          JSON.stringify({ success: false, error: 'Security verification failed. Please try again.' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // Customer info
    const customer = body.customer || {};
    const name = (customer.name || '').trim();
    const company = (customer.company || '').trim();
    const email = (customer.email || '').trim();
    const phone = (customer.phone || '').trim();

    if (!name || !company || !email || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name, company, email, and phone are all required' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Parts list
    const rawParts = Array.isArray(body.parts) ? body.parts : [];
    const cleanParts = [];
    for (const p of rawParts) {
      const partNumber = (p.part_number || '').trim();
      const description = (p.description || '').trim();
      const qtyRaw = p.quantity;
      const quantity = parseInt(qtyRaw, 10);
      if (!partNumber && !description && (!qtyRaw || isNaN(quantity))) continue; // skip fully-empty rows
      if (!partNumber || !description || isNaN(quantity) || quantity < 1) {
        return new Response(
          JSON.stringify({ success: false, error: 'Each part row needs a Part Number, Description, and positive Quantity' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
      cleanParts.push({ partNumber, description, quantity });
    }
    if (cleanParts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Add at least one part row' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const attribution = normalizeAttribution(body.attribution || body.dolphin_attribution, 'parts_request_form');
    const visitorContext = getVisitorContext(request);

    // Build email
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
    const subject = `Parts Request from ${company} - ${cleanParts.length} part${cleanParts.length === 1 ? '' : 's'}`;
    const rowsHtml = cleanParts.map((p) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-family:monospace;">${esc(p.partNumber)}</td>
        <td style="padding:8px;border:1px solid #ddd;">${esc(p.description)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.quantity}</td>
      </tr>
    `).join('');
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;color:#1f2937;">
        <h2 style="color:#0a2540;border-bottom:2px solid #c9a45c;padding-bottom:6px;">Parts Request</h2>
        <p><strong>From:</strong> ${esc(name)}</p>
        <p><strong>Company:</strong> ${esc(company)}</p>
        <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
        <p><strong>Phone:</strong> ${esc(phone)}</p>
        <h3 style="margin-top:24px;">Requested Parts (${cleanParts.length})</h3>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <thead>
            <tr style="background:#0a2540;color:#fff;">
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Part Number</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Description</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qty</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#6b7280;">Submitted via dolphincentrifuge.com /alfa-laval-centrifuge-parts/</p>
      </div>
    `;

    // Save to D1 before email so an email outage cannot lose the lead.
    if (env.DB) {
      try {
        const nameParts = splitName(name);
        const partsSummary = cleanParts.map((part) => (
          `${part.quantity} x ${part.partNumber} - ${part.description}`
        )).join('\n');

        await insertSubmission(env, {
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          company,
          email,
          phone,
          contactMethod: '',
          country: '',
          usState: '',
          fluidType: 'Parts Request',
          capacity: `${cleanParts.length} part${cleanParts.length === 1 ? '' : 's'}`,
          solidsPercentage: '',
          centrifugeCondition: '',
          additionalDetails: partsSummary,
          isReconnect: 0,
          reconnectMatchId: null,
          formType: attribution.formName || 'parts_request_form',
          attribution,
          visitorContext,
          partsJson: safeJson(cleanParts, 10000),
          partsCount: cleanParts.length,
        });
      } catch (dbErr) {
        console.error('LEAD_RECOVERY_PAYLOAD', JSON.stringify({
          form: 'parts', name, company, email, phone, parts: cleanParts,
        }));
        console.error('D1 insert error (parts):', dbErr.message);
      }
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dolphin Centrifuge <noreply@dolphincentrifuge.com>',
        to: ['sales@dolphincentrifuge.com'],
        reply_to: email,
        subject: subject,
        html: html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Resend API error (parts):', errorBody);
      return new Response(
        JSON.stringify({ success: false, error: 'Email send failed - please call (248) 522-2573' }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('Parts submit error:', err && err.message);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error - please call (248) 522-2573' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ── FORM: Handle a contact form submission ───────────────────
async function handleFormSubmit(request, env) {
  try {
    // Parse form data
    const contentType = request.headers.get('Content-Type') || '';
    let fields = {};
    try {
      if (contentType.includes('application/json')) {
        fields = await request.json();
      } else {
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          fields[key] = value;
        }
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid body' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Honeypot spam check
    if (fields['bot-field']) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot detected' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Turnstile verification (if keys present)
    const turnstileToken = fields['cf-turnstile-response'];
    if (turnstileToken && env.TURNSTILE_SECRET_KEY) {
      let verified = true;
      try {
        verified = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, request);
      } catch (turnstileErr) {
        console.error('Turnstile verification infrastructure error:', turnstileErr && turnstileErr.message);
      }
      if (!verified) {
        return new Response(
          JSON.stringify({ success: false, error: 'Security verification failed. Please try again.' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // Extract fields
    const firstName         = (fields['first_name'] || '').trim();
    const lastName          = (fields['last_name'] || '').trim();
    const company           = (fields['company'] || '').trim();
    const email             = (fields['email'] || '').trim();
    const phone             = (fields['phone'] || '').trim();
    const contactMethod     = (fields['contact_method'] || '').trim();
    const country           = (fields['country'] || '').trim();
    const usState           = (fields['us_state'] || '').trim();
    const fluidType         = (fields['fluid_type'] || '').trim();
    const capacity          = (fields['required_flow_rate'] || fields['capacity'] || '').trim();
    const solidsPercentage  = (fields['solids_percentage'] || '').trim();
    const centrifugeCondition = (fields['centrifuge_condition'] || '').trim();
    const additionalDetails = (fields['additional_details'] || '').trim();
    const countryOther      = (fields['country_other'] || '').trim();
    const attribution       = normalizeAttribution(fields['dolphin_attribution'] || fields.attribution, 'centrifuge_contact_form');
    const visitorContext    = getVisitorContext(request);
    const countryDisplay    = country === 'Other' && countryOther ? `Other — ${countryOther}` : country;

    // Basic validation
    if (!firstName || !lastName || !email || !company || !phone || !fluidType || !capacity) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please fill in all required fields.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid email address.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // ── Reconnect check ──────────────────────────────────────
    let isReconnect = 0;
    let reconnectMatchId = null;
    let reconnectMatch = null;

    if (env.DB) {
      try {
        const phoneStripped = phone.replace(/[\s\-().+]/g, '');
        const { results: matches } = await env.DB.prepare(`
          SELECT id, first_name, last_name, company, email, created_at
          FROM submissions
          WHERE deleted = 0 AND (
            LOWER(email) = LOWER(?)
            OR REPLACE(REPLACE(REPLACE(REPLACE(phone,' ',''),'-',''),'(',''),')','') = ?
            OR LOWER(company) = LOWER(?)
          )
          ORDER BY created_at DESC
          LIMIT 1
        `).bind(email, phoneStripped, company).all();

        if (matches && matches.length > 0) {
          isReconnect = 1;
          reconnectMatch = matches[0];
          reconnectMatchId = reconnectMatch.id;
        }
      } catch (dbErr) {
        console.error('Reconnect check error:', dbErr.message);
        // Non-fatal — continue with submission
      }
    }

    // ── Format labels for email ──────────────────────────────
    const contactMethodMap = {
      'phone_dolphin_calls': 'Phone — Dolphin Centrifuge will call them',
      'phone_you_call':      'Phone — They will call Dolphin: (248) 522-2573',
      'email':               'Email',
    };
    const contactMethodLabel = contactMethodMap[contactMethod] || contactMethod;
    // Highlight the contact-method row when the customer asked Dolphin to call THEM
    // (an action item for us) so it stands out in the emailed form.
    const callFromDolphin = contactMethod === 'phone_dolphin_calls';

    const conditionMap = {
      'new_required':      'New centrifuge required',
      'remanufactured_ok': 'Remanufactured acceptable',
    };
    const conditionLabel = conditionMap[centrifugeCondition] || centrifugeCondition;

    // ── Format U.S. phone for email display only ─────────────
    const formatUsPhone = (raw, ctry) => {
      if (ctry !== 'US') return raw;
      const digits = raw.replace(/\D/g, '');
      if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
      return raw;
    };
    const phoneDisplay = formatUsPhone(phone, country);

    // ── Build standard inquiry email HTML ────────────────────
    const row = (label, value, shade, highlight) => `
      <tr style="background-color:${highlight || (shade ? '#f0f0f0' : '#ffffff')}">
        <td style="padding:8px 12px; font-family:Arial,sans-serif; font-size:13px; font-weight:bold; color:#333; border:1px solid #ddd; width:42%; vertical-align:top;">${label}</td>
        <td style="padding:8px 12px; font-family:Arial,sans-serif; font-size:13px; color:#333; border:1px solid #ddd;">${value}</td>
      </tr>`;

    const sectionHeader = (title) => `
      <tr>
        <td colspan="2" style="padding:10px 12px; font-family:Arial,sans-serif; font-size:14px; font-weight:bold; color:#333; background-color:#c8c8c8; border:1px solid #ddd;">${title}</td>
      </tr>`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Centrifuge Information Request</title></head>
<body style="margin:0; padding:20px; font-family:Arial,sans-serif; background-color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:640px;">
    ${sectionHeader('Customer Details')}
    ${row('Name', `${firstName} ${lastName}`, false)}
    ${row('Company Name', company, true)}
    ${row('Email', `<a href="mailto:${email}" style="color:#1155CC;">${email}</a>`, false)}
    ${row('Phone', phoneDisplay, true)}
    ${row('Preferred method of contact:', callFromDolphin ? `<strong>${contactMethodLabel}</strong>` : contactMethodLabel, false, callFromDolphin ? '#FFE0B2' : null)}
    ${row('Country', countryDisplay, true)}
    ${row('US State', usState || '—', false)}
    ${sectionHeader('Application Details')}
    ${row('Type of Fluid', fluidType, false)}
    ${row('Required Flow Rate', capacity, true)}
    ${row('Percentage of Solids by Volume', solidsPercentage || '—', false)}
    ${row('Do you require a New Centrifuge or is a Remanufactured centrifuge acceptable?', conditionLabel, true)}
    ${row('Additional Details', additionalDetails ? additionalDetails.replace(/\n/g, '<br>') : '—', false)}
  </table>
</body>
</html>`;

    // Save to D1 before email so an email outage cannot lose the lead.
    if (env.DB) {
      try {
        await insertSubmission(env, {
          firstName,
          lastName,
          company,
          email,
          phone,
          contactMethod,
          country,
          usState,
          fluidType,
          capacity,
          solidsPercentage,
          centrifugeCondition,
          additionalDetails,
          isReconnect,
          reconnectMatchId,
          formType: 'contact',
          attribution,
          visitorContext,
          partsJson: '',
          partsCount: 0,
        });
      } catch (dbErr) {
        console.error('LEAD_RECOVERY_PAYLOAD', JSON.stringify({
          form: 'contact', firstName, lastName, company, email, phone,
        }));
        console.error('D1 insert error:', dbErr.message);
      }
    }

    // ── Send standard inquiry email ──────────────────────────
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     `${firstName} ${lastName} <noreply@dolphincentrifuge.com>`,
        to:       ['sales@dolphincentrifuge.com'],
        reply_to: email,
        subject:  `Centrifuge Information Request | ${firstName} ${lastName}`,
        html:     emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Resend API error:', errorBody);
      throw new Error('Email delivery failed. Please call us at (248) 522-2573.');
    }

    // ── Send reconnect alert email if applicable ─────────────
    if (isReconnect && reconnectMatch && env.RESEND_API_KEY) {
      const reconnectHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Returning Customer Alert</title></head>
<body style="margin:0; padding:20px; font-family:Arial,sans-serif; background-color:#fff7e6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:640px;">
    <tr>
      <td style="padding:16px 20px; background-color:#e8c204; font-family:Arial,sans-serif; font-size:18px; font-weight:bold; color:#1a2a4a;">
        ⚡ Returning Customer Alert
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px; font-family:Arial,sans-serif; font-size:14px; color:#333; background-color:#fff7e6;">
        <p>A new form submission matches an existing entry in your database. This may be a high-value reconnection.</p>
        <table width="100%" style="border-collapse:collapse; margin-top:12px;">
          <tr style="background:#ffffff;">
            <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd; width:50%;">New Submission</td>
            <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Previous Match</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:8px 12px; border:1px solid #ddd;">${firstName} ${lastName}</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">${reconnectMatch.first_name} ${reconnectMatch.last_name}</td>
          </tr>
          <tr style="background:#ffffff;">
            <td style="padding:8px 12px; border:1px solid #ddd;">${company}</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">${reconnectMatch.company}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:8px 12px; border:1px solid #ddd;">${email}</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">${reconnectMatch.email}</td>
          </tr>
          <tr style="background:#ffffff;">
            <td style="padding:8px 12px; border:1px solid #ddd;">Submitted just now</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">Previously: ${reconnectMatch.created_at?.substring(0, 10) || 'unknown'}</td>
          </tr>
        </table>
        <p style="margin-top:16px;">Review both entries in your <strong>Admin Dashboard</strong>.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Fire-and-forget — don't await, don't fail the main request
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'Dolphin CRM <noreply@dolphincentrifuge.com>',
          to:      ['sales@dolphincentrifuge.com'],
          subject: `⚡ Returning Customer — ${firstName} ${lastName} | ${company}`,
          html:    reconnectHtml,
        }),
      }).catch(err => console.error('Reconnect email error:', err.message));
    }

    // ── Success ──────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your inquiry has been received! Our team will respond within a few business days.',
      }),
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error('Worker error:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred. Please call us at (248) 522-2573.',
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ── Cloudflare Turnstile verification helper ─────────────────
async function verifyTurnstile(token, secretKey, request) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secretKey, response: token, remoteip: ip }),
  });
  const result = await verifyResponse.json();
  return result.success === true;
}
