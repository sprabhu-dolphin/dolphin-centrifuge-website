#!/usr/bin/env node
/**
 * Build-time spec contradiction guard.
 *
 * Runs after `astro build` (see the `build` script in package.json) and FAILS the
 * build if the rendered site contradicts the authoritative spec source.
 *
 * It reads the freshly built `dist/specs.json` - the same data every refactored
 * spec table renders from - so the guard and the pages can never disagree about
 * what the right answer is.
 *
 * Two checks:
 *
 *   A. FORBIDDEN VALUES. Each model carries `rejectedValues`: numbers that were
 *      published in error and corrected by an owner ruling. If one of those turns
 *      up near a mention of that model on any page, the build fails. The list is
 *      maintained inside `src/data/centrifugeSpecs.ts`, alongside the ruling that
 *      killed it, so it maintains itself as new rulings land.
 *      Retired designations (DMSC-042, SSB-206, CBPX-213-XP) are forbidden anywhere.
 *
 *   B. MODEL-PAGE ASSERTION. Each model's own page must still carry its canonical
 *      capacity, bowl speed and motor power. This catches silent drift: a value
 *      quietly deleted or edited away on the page it belongs to.
 *
 * Plain node, no dependencies. Typical runtime is a couple of seconds.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SPECS = path.join(DIST, 'specs.json');

/** How far from a model mention a forbidden value still counts as "near it". */
const PROXIMITY_CHARS = 320;
/** Window used to test a rejected value's `unless` exemption and its family context. */
const CONTEXT_CHARS = 180;

/** Words that identify which kind of machine a passage is talking about. */
const FAMILY_WORDS = {
  'disc-stack': /disc[\s-]?stack|disc centrifuge|separator bowl/i,
  decanter: /decanter|tricanter|scroll conveyor/i,
  basket: /basket centrifuge/i,
};

/* --------------------------------------------------------------- utilities */

function fail(message) {
  console.error(`\n  spec-consistency-check: ${message}\n`);
  process.exit(1);
}

/** Visible page text plus meta/alt attribute values, tags and scripts stripped. */
function pageText(html) {
  const attributes = [];
  for (const match of html.matchAll(/\b(?:content|alt|title)="([^"]*)"/g)) {
    attributes.push(match[1]);
  }
  const stripped = html
    // drop non-JSON-LD scripts and all styles; JSON-LD stays, drift there matters too
    .replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decode(`${stripped} ${attributes.join(' ')}`).replace(/\s+/g, ' ');
}

function decode(text) {
  return text
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;|&#38;/g, '&')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ndash;|&#8211;/g, '-')
    .replace(/&mdash;|&#8212;/g, '-')
    .replace(/&deg;|&#176;/g, '°')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turn a published literal such as "3,157 Gs" or "50 GPM" into a tolerant regex:
 * thousands separators optional, whitespace flexible, and never matching inside a
 * longer number (so "50 GPM" does not fire on "150 GPM").
 */
function literalPattern(literal) {
  const body = escapeRegex(literal)
    .replace(/(\d)\\?,(\d)/g, '$1[,]?$2')
    .replace(/\\?\s+/g, '\\s*');
  return new RegExp(`(?<![\\d.,])${body}`, 'i');
}

/**
 * A number as pages print it: thousands separator optional, and a whole number
 * also matching its ".0" form, because "5 HP" and "5.0 HP" are the same motor.
 */
function numberPattern(value) {
  const plain = String(value);
  const grouped = Number(value).toLocaleString('en-US');
  const alternatives = [...new Set([plain, grouped])].map((form) =>
    escapeRegex(form).replace(/(\d)\\?,(\d)/g, '$1[,]?$2'),
  );
  const decimal = Number.isInteger(Number(value)) ? '(?:\\.0+)?' : '';
  return `(?:${alternatives.join('|')})${decimal}`;
}

function routeToFile(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return path.join(DIST, clean, 'index.html');
}

/* ------------------------------------------------------------- load inputs */

if (!fs.existsSync(SPECS)) {
  fail(`dist/specs.json is missing. Run the Astro build before this check.`);
}

let specs;
try {
  specs = JSON.parse(fs.readFileSync(SPECS, 'utf8'));
} catch (error) {
  fail(`dist/specs.json is not valid JSON: ${error.message}`);
}

const { models = [], retiredDesignations = [] } = specs;
if (!models.length) fail('dist/specs.json contains no models.');

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index.html') pages.push(full);
  }
})(DIST);

const textByFile = new Map();
for (const file of pages) {
  textByFile.set(file, pageText(fs.readFileSync(file, 'utf8')));
}

const route = (file) =>
  '/' + path.relative(DIST, file).split(path.sep).slice(0, -1).join('/') + (path.relative(DIST, file).includes(path.sep) ? '/' : '');

const violations = [];

/* ----------------------------------------- A1. retired designations, anywhere */

for (const retired of retiredDesignations) {
  const pattern = new RegExp(escapeRegex(retired.text), 'i');
  for (const [file, text] of textByFile) {
    if (pattern.test(text)) {
      violations.push({
        page: route(file),
        model: '(site-wide)',
        value: retired.text,
        reason: retired.reason,
      });
    }
  }
}

/* -------------------------------- A2. rejected values near their model mention */

/**
 * A model "owns" a spot on the page if it is the NEAREST model named to it. Pages
 * that list several machines side by side would otherwise trip every model's rules
 * at once; nearest-mention scoping keeps a number attached to the machine it is
 * actually printed against.
 */
function mentionRegex(names) {
  const body = names
    .map((name) => escapeRegex(name).replace(/[\s\\-]+/g, '[\\s-]?'))
    .join('|');
  return new RegExp(`(?<![A-Za-z0-9])(?:${body})(?![A-Za-z0-9])`, 'gi');
}

const modelMentionRegex = new Map(
  models.map((model) => [model.id, mentionRegex([model.designation, ...(model.aliases ?? [])])]),
);

/** All model mentions on a page, sorted by position: [{ index, end, modelId }]. */
const mentionsByFile = new Map();
for (const [file, text] of textByFile) {
  const found = [];
  for (const model of models) {
    const regex = new RegExp(modelMentionRegex.get(model.id).source, 'gi');
    for (const match of text.matchAll(regex)) {
      found.push({ index: match.index, end: match.index + match[0].length, modelId: model.id });
    }
  }
  found.sort((a, b) => a.index - b.index);
  mentionsByFile.set(file, found);
}

function nearestModel(mentions, position) {
  let best = null;
  let bestDistance = Infinity;
  for (const mention of mentions) {
    const distance =
      position < mention.index ? mention.index - position : position > mention.end ? position - mention.end : 0;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = mention;
    }
  }
  return bestDistance <= PROXIMITY_CHARS ? best : null;
}

function excerpt(text, position, length) {
  const start = Math.max(0, position - 70);
  const end = Math.min(text.length, position + length + 70);
  return `${start > 0 ? '...' : ''}${text.slice(start, end).trim()}${end < text.length ? '...' : ''}`;
}

for (const model of models) {
  const rejected = model.rejectedValues ?? [];
  if (!rejected.length) continue;

  for (const item of rejected) {
    const regex = new RegExp(literalPattern(item.text).source, 'gi');
    for (const [file, text] of textByFile) {
      const mentions = mentionsByFile.get(file);
      if (!mentions.length) continue;
      const seen = new Set();
      const unless = item.unless ? new RegExp(item.unless, 'i') : null;
      for (const match of text.matchAll(regex)) {
        const owner = nearestModel(mentions, match.index);
        if (!owner || owner.modelId !== model.id) continue;

        const context = text.slice(
          Math.max(0, match.index - CONTEXT_CHARS),
          match.index + match[0].length + CONTEXT_CHARS,
        );

        // The ruling itself allows this reading (e.g. a duty-labelled figure).
        if (unless && unless.test(context)) continue;

        // The passage is plainly about a different kind of machine: a decanter
        // number sitting next to a disc-stack paragraph is not this model's.
        const own = FAMILY_WORDS[model.family];
        const others = Object.entries(FAMILY_WORDS).filter(([family]) => family !== model.family);
        if (own && !own.test(context) && others.some(([, pattern]) => pattern.test(context))) continue;

        const key = `${file}|${item.text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        violations.push({
          page: route(file),
          model: model.designation,
          value: item.text,
          reason: item.reason,
          excerpt: excerpt(text, match.index, match[0].length),
        });
      }
    }
  }
}

/* ------------------------------------------------- B. model-page assertions */

const missing = [];

function assertOn(routePath, label, pattern, description) {
  const file = routeToFile(routePath);
  const text = textByFile.get(file);
  if (text === undefined) {
    missing.push({ page: routePath, model: label, what: `page not found in dist` });
    return;
  }
  if (!pattern.test(text)) {
    missing.push({ page: routePath, model: label, what: description });
  }
}

for (const model of models) {
  if (!model.canonicalPath) continue;
  const skip = new Set(model.skipPageAssert ?? []);

  if (!skip.has('capacity')) {
    for (const capacity of model.capacities ?? []) {
      const target = capacity.assertOnPath ?? model.canonicalPath;
      if (capacity.label) {
        assertOn(target, model.designation, literalPattern(decode(capacity.label)), `capacity "${capacity.label}"`);
        continue;
      }
      const values = Array.isArray(capacity.value) ? capacity.value : [capacity.value];
      const unit = capacity.unit === 'US GPM' ? '(?:US\\s*)?GPM' : escapeRegex(capacity.unit).replace(/\\?\//, '\\s*/\\s*');
      const body = values.map(numberPattern).join('\\s*[-\u2013]\\s*');
      assertOn(
        target,
        model.designation,
        new RegExp(`(?<![\\d.,])${body}\\s*${unit}`, 'i'),
        `capacity ${values.join('-')} ${capacity.unit} (${capacity.fluid})`,
      );
    }
  }

  if (!skip.has('rpm') && typeof model.bowlSpeedRpm === 'number') {
    const rpm = numberPattern(model.bowlSpeedRpm);
    // Pages print it either as "8,600 RPM" or as a row labelled "Bowl RPM | 8,600".
    assertOn(
      model.canonicalPath,
      model.designation,
      new RegExp(`(?<![\\d.,])${rpm}\\s*RPM|RPM[^0-9]{0,40}(?<![\\d.,])${rpm}`, 'i'),
      `bowl speed ${model.bowlSpeedRpm} RPM`,
    );
  }

  if (!skip.has('hp') && typeof model.motorHp === 'number') {
    assertOn(
      model.canonicalPath,
      model.designation,
      new RegExp(`(?<![\\d.,])${numberPattern(model.motorHp)}\\s*(?:HP|hp)`),
      `motor power ${model.motorHp} HP`,
    );
  }
}

/* --------------------------------------- C. capacity label / value coherence */

for (const model of models) {
  for (const capacity of model.capacities ?? []) {
    if (!capacity.label) continue;
    const values = Array.isArray(capacity.value) ? capacity.value : [capacity.value];
    for (const value of values) {
      if (!new RegExp(`(?<![\\d.,])${numberPattern(value)}`).test(capacity.label)) {
        violations.push({
          page: 'src/data/centrifugeSpecs.ts',
          model: model.designation,
          value: String(value),
          reason: `capacity label "${capacity.label}" no longer contains its own value ${value}. Update both, or drop the label.`,
        });
      }
    }
  }
}

/* -------------------------------------------------------------- report out */

const pageCount = pages.length;
const modelCount = models.length;
const rejectedCount = models.reduce((sum, model) => sum + (model.rejectedValues?.length ?? 0), 0);

if (violations.length || missing.length) {
  console.error('\nSPEC CONSISTENCY CHECK FAILED\n');

  if (violations.length) {
    console.error(`  ${violations.length} forbidden value(s) found:\n`);
    for (const item of violations) {
      console.error(`    ${item.page}`);
      console.error(`      model : ${item.model}`);
      console.error(`      value : ${item.value}`);
      console.error(`      why   : ${item.reason}`);
      if (item.excerpt) console.error(`      text  : ${item.excerpt}`);
      console.error('');
    }
  }

  if (missing.length) {
    console.error(`  ${missing.length} canonical value(s) missing from their own model page:\n`);
    for (const item of missing) {
      console.error(`    ${item.page}  [${item.model}]  missing ${item.what}`);
    }
    console.error('');
  }

  console.error('  Fix the page, or change the number in src/data/centrifugeSpecs.ts.');
  console.error('  See docs/SPEC_SOURCE.md.\n');
  process.exit(1);
}

console.log(
  `spec-consistency-check: OK - ${modelCount} models, ${rejectedCount} rejected values, ${pageCount} pages scanned.`,
);
