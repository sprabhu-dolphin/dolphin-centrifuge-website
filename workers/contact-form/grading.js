const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const VALID_GRADES = new Set(['A', 'B', 'C']);

const KILL_PATTERNS = [
  /\bsmall\b/i,
  /\bmini\b/i,
  /\bhome\b/i,
  /\bDIY\b/i,
  /\bcheap\b/i,
  /\bhobby(?:ist)?\b/i,
  /\bbench\s*top\b/i,
  /\bbenchtop\b/i,
  /\blab\s*scale\b/i,
  /\btable\s*top\b/i,
  /\btabletop\b/i,
  /\bjuice\b/i,
  /\bmilk\b/i,
  /\bblood\b/i,
  /\blaborator(?:y|ies)\b/i,
  /\bcream\s+separator\b/i,
  /\bfilter\s+cartridge\b/i,
  /\brent(?:al|ing)?\b/i,
  /\bhow\s+to\s+build\b/i,
  /\bhomemade\b/i,
  /\bmanual\s+pdf\b/i,
  /\bfree\b/i,
  /\bcraigslist\b/i,
  /\bebay\b/i,
  /\balibaba\b/i,
];

const PORTABLE_RE = /\bportable\b/i;
const INDUSTRIAL_PORTABLE_CONTEXT_RE = /\b(skid|trailer|rig|barge|marine|plant|facility)\b/i;
const MODEL_FAMILY_RE = /\b(WHPX|MOPX|MAPX|BTPX|BRPX|NX)\b/i;
const RECONDITIONED_RE = /\b(reconditioned|rebuilt|refurbished|remanufactured)\b/i;
const EQUIPMENT_RE = /\b(centrifuge|separator|purifier|decanter)\b/i;

function cleanText(value, max = 5000) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function oneLine(value, max = 140) {
  return cleanText(value, max).replace(/[\r\n]+/g, ' ').slice(0, max);
}

function getLeadName(lead) {
  return [lead.first_name, lead.last_name].map((part) => cleanText(part, 80)).filter(Boolean).join(' ');
}

function getLeadMessage(lead) {
  return [
    lead.fluid_type,
    lead.capacity,
    lead.solids_percentage,
    lead.centrifuge_condition,
    lead.additional_details,
    lead.parts_json,
  ].map((value) => cleanText(value, 2000)).filter(Boolean).join('\n');
}

function getLeadPage(lead) {
  return cleanText(lead.attribution_current_page || lead.attribution_landing_page || lead.form_type || '', 500);
}

function getLeadSource(lead) {
  const channel = [lead.attribution_source, lead.attribution_medium, lead.attribution_campaign]
    .map((value) => cleanText(value, 120))
    .filter(Boolean)
    .join('/');
  const click = lead.attribution_gclid ? 'gclid' : (lead.attribution_gbraid ? 'gbraid' : (lead.attribution_wbraid ? 'wbraid' : ''));
  return [channel, click].filter(Boolean).join(' ') || 'direct/unknown';
}

function joinedLeadText(lead) {
  return [
    getLeadName(lead),
    lead.company,
    lead.email,
    lead.phone,
    getLeadMessage(lead),
    getLeadPage(lead),
    getLeadSource(lead),
  ].map((value) => cleanText(value, 2000)).filter(Boolean).join('\n');
}

function obviousSpamReason(text) {
  const urlCount = (text.match(/\bhttps?:\/\/|\bwww\./gi) || []).length;
  const alphaWords = (text.match(/[a-z]{3,}/gi) || []).length;
  if (urlCount >= 3 && alphaWords < 30) return 'URL-stuffed message with no clear centrifuge application.';
  if (text.length >= 24 && alphaWords < 3) return 'Gibberish message with no clear application content.';
  return '';
}

function deterministicGrade(lead) {
  const text = joinedLeadText(lead);
  const spam = obviousSpamReason(text);
  if (spam) return { decided: true, grade: 'C', reason: spam, stage: 'rules' };

  const hasPortable = PORTABLE_RE.test(text);
  const industrialPortable = hasPortable && INDUSTRIAL_PORTABLE_CONTEXT_RE.test(text);
  if (hasPortable && !industrialPortable) {
    return { decided: true, grade: 'C', reason: 'Portable use request without industrial skid, trailer, rig, plant, or marine context.', stage: 'rules' };
  }

  const killPattern = KILL_PATTERNS.find((pattern) => pattern.test(text));
  if (killPattern) {
    return { decided: true, grade: 'C', reason: 'Explicit low-fit or non-industrial wording matched the lead screen.', stage: 'rules' };
  }

  const strongA = MODEL_FAMILY_RE.test(text) || (RECONDITIONED_RE.test(text) && EQUIPMENT_RE.test(text));
  return { decided: false, strongA, stage: 'rules' };
}

function buildPrompt(lead, strongA) {
  const bias = strongA
    ? '\nStrong A signal is present, but still grade B or C if the buyer/application is not plausible.'
    : '';
  return `You grade sales leads for Dolphin Centrifuge, a dealer of reconditioned
industrial Alfa Laval centrifuges (typical ticket $15,000+). Grade this
contact-form lead A, B, or C.

A = industrial buyer with a real application and plausible budget.
    Signals: company name present, corporate email domain, named process
    fluid (waste oil, fuel oil, diesel, coolant, wastewater, etc.),
    flow-rate or volume numbers, Alfa Laval model numbers (WHPX, MOPX,
    MAPX, BTPX, BRPX, NX), marine/industrial/plant context.
B = plausible but unqualified. Application unclear, budget unknown,
    generic inquiry, freemail address with thin detail. WHEN IN DOUBT, B.
C = clearly not a buyer: DIY/hobbyist, home/garage use, lab-scale,
    student project, parts-only tire kicker, job seeker, vendor pitch,
    spam. Only grade C when the evidence is explicit.${bias}

Respond with JSON only: {"grade":"A|B|C","reason":"<one line, max 140 chars>"}

LEAD:
Name: ${getLeadName(lead)}
Company: ${cleanText(lead.company, 200)}
Email: ${cleanText(lead.email, 200)}
Phone: ${cleanText(lead.phone, 100)}
Message: ${getLeadMessage(lead)}
Page: ${getLeadPage(lead)}
Source: ${getLeadSource(lead)}`;
}

function parseJsonResponse(output) {
  const candidate = output && typeof output === 'object' && output.response !== undefined
    ? output.response
    : output;
  if (candidate && typeof candidate === 'object') return candidate;
  if (typeof candidate !== 'string') throw new Error('AI response was not JSON text');
  const text = candidate.trim();
  if (!text.startsWith('{') || !text.endsWith('}')) throw new Error('AI response was not a JSON object');
  return JSON.parse(text);
}

export async function autoGradeLead(lead, env, options = {}) {
  const deterministic = deterministicGrade(lead);
  if (deterministic.decided) {
    return {
      grade: deterministic.grade,
      reason: oneLine(deterministic.reason),
      stage: deterministic.stage,
      failed: false,
    };
  }

  if (!env || !env.AI || typeof env.AI.run !== 'function') {
    return {
      grade: null,
      reason: 'auto-grade failed: Workers AI binding unavailable',
      stage: 'ai',
      failed: true,
    };
  }

  try {
    const output = await env.AI.run(options.model || env.LEAD_GRADING_MODEL || DEFAULT_MODEL, {
      messages: [
        { role: 'user', content: buildPrompt(lead, deterministic.strongA) },
      ],
      temperature: 0,
      max_tokens: 180,
      response_format: {
        type: 'json_schema',
        json_schema: {
          type: 'object',
          properties: {
            grade: { type: 'string', enum: ['A', 'B', 'C'] },
            reason: { type: 'string' },
          },
          required: ['grade', 'reason'],
        },
      },
    });
    const parsed = parseJsonResponse(output);
    const grade = cleanText(parsed.grade, 1).toUpperCase();
    if (!VALID_GRADES.has(grade)) throw new Error('AI JSON had invalid grade');
    const reason = oneLine(parsed.reason || 'Auto-graded by Workers AI.');
    if (!reason) throw new Error('AI JSON had empty reason');
    return { grade, reason, stage: 'ai', failed: false };
  } catch (err) {
    return {
      grade: null,
      reason: oneLine(`auto-grade failed: ${err && err.message ? err.message : 'AI classification error'}`),
      stage: 'ai',
      failed: true,
    };
  }
}

export async function gradeLead(env, leadId, options = {}) {
  const id = Number(leadId);
  if (!env || !env.DB || !Number.isFinite(id) || id <= 0) {
    return { success: false, failed: true, reason: 'auto-grade failed: missing DB or lead id' };
  }

  try {
    const row = await env.DB.prepare('SELECT * FROM submissions WHERE id = ? AND deleted = 0').bind(id).first();
    if (!row) return { success: false, failed: true, reason: 'auto-grade failed: lead row not found' };

    const classification = await autoGradeLead(row, env, options);
    const grade = VALID_GRADES.has(classification.grade) ? classification.grade : null;
    const reason = oneLine(classification.reason || 'auto-grade failed: no reason');
    const now = new Date().toISOString();
    const result = await env.DB.prepare(`
      UPDATE submissions
      SET grade = ?, grade_source = 'auto', grade_reason = ?, graded_at = ?
      WHERE id = ? AND (grade_source IS NULL OR grade_source != 'manual')
    `).bind(grade, reason, now, id).run();
    return {
      success: true,
      id,
      grade,
      reason,
      failed: Boolean(classification.failed),
      updated: Number(result && result.meta && result.meta.changes || 0),
    };
  } catch (err) {
    console.error('Lead auto-grade error:', err && err.message);
    return {
      success: false,
      id,
      grade: null,
      reason: oneLine(`auto-grade failed: ${err && err.message ? err.message : 'unknown error'}`),
      failed: true,
    };
  }
}

async function runLimited(items, concurrency, worker) {
  const queue = [...items];
  const results = [];
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      results.push(await worker(item));
    }
  });
  await Promise.all(workers);
  return results;
}

export async function runLeadGradeBackfill(env, options = {}) {
  const limit = Math.min(1000, Math.max(1, Number(options.limit || 1000)));
  const { results = [] } = await env.DB.prepare(`
    SELECT id
    FROM submissions
    WHERE deleted = 0
      AND grade IS NULL
      AND (grade_source IS NULL OR grade_source != 'manual')
    ORDER BY created_at ASC, id ASC
    LIMIT ${limit}
  `).all();

  const summary = {
    processed: 0,
    graded_a: 0,
    graded_b: 0,
    graded_c: 0,
    failed: 0,
  };

  const graded = await runLimited(results, 5, (row) => gradeLead(env, row.id, options));
  for (const result of graded) {
    summary.processed += 1;
    if (result.grade === 'A') summary.graded_a += 1;
    else if (result.grade === 'B') summary.graded_b += 1;
    else if (result.grade === 'C') summary.graded_c += 1;
    if (result.failed || !result.grade) summary.failed += 1;
  }
  return summary;
}
