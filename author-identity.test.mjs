import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const canonicalProfile = 'https://dolphincentrifuge.com/authors/sanjay-prabhu/';
const canonicalPersonId = `${canonicalProfile}#person`;
const canonicalJson = 'https://dolphincentrifuge.com/authors/sanjay-prabhu.json';
const linkedIn = 'https://www.linkedin.com/in/sanjay-prabhu-a987085';
const thesisRecord =
  'https://onesearch.uark.edu/permalink/01UARK_INST/6np6g9/alma991022032739707336';
const seniorWalkData =
  'https://campusdata.uark.edu/apiv2/map/seniorwalklist/1991';

const walkFiles = (directory) => {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const absolute = path.join(directory, entry);
    if (statSync(absolute).isDirectory()) files.push(...walkFiles(absolute));
    else files.push(absolute);
  }
  return files;
};

const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

const schemaTypes = (node) => {
  const type = node?.['@type'];
  return (Array.isArray(type) ? type : [type]).filter(Boolean).map(String);
};

const collectSanjayPeople = (value, found = []) => {
  if (Array.isArray(value)) {
    for (const entry of value) collectSanjayPeople(entry, found);
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  if (
    schemaTypes(value).includes('Person') &&
    /^Sanjay\s+Prabhu\b/i.test(String(value.name || ''))
  ) {
    found.push(value);
  }
  for (const child of Object.values(value)) collectSanjayPeople(child, found);
  return found;
};

test('production source and active instructions contain no stale author identity', () => {
  const sourceFiles = walkFiles(path.join(root, 'src')).filter((file) =>
    /\.(astro|ts|tsx|js|mjs|json)$/i.test(file),
  );
  const activeInstructionFiles = [
    'AEO_GEO_OPERATING_PLAN.md',
    'AEO_GEO_SKILL.md',
    'DOLPHIN_GEO_ROADMAP.md',
    '.agents/rules/aeo_geo_pathway.md',
    '.agents/rules/astro-migration.md',
  ].map((file) => path.join(root, file));

  for (const file of [...sourceFiles, ...activeInstructionFiles]) {
    const content = readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /Class of 1990/i, file);
    assert.doesNotMatch(
      content,
      /about-dolphin-centrifuge\/#sanjay-prabhu/i,
      file,
    );
  }
});

test('LLM guide exposes the canonical profile, JSON record, and University evidence', () => {
  const llms = read('public/llms.txt');
  assert.match(llms, new RegExp(canonicalProfile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(llms, new RegExp(canonicalJson.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(llms, new RegExp(thesisRecord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(llms, new RegExp(seniorWalkData.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('built author profile and machine record agree on one identity', () => {
  const profilePath = path.join(root, 'dist/authors/sanjay-prabhu/index.html');
  const jsonPath = path.join(root, 'dist/authors/sanjay-prabhu.json');
  assert.equal(existsSync(profilePath), true, 'author profile was not built');
  assert.equal(existsSync(jsonPath), true, 'author JSON record was not built');

  const profileHtml = readFileSync(profilePath, 'utf8');
  const record = JSON.parse(readFileSync(jsonPath, 'utf8'));
  assert.match(profileHtml, /<[^>]+id="person"/);
  assert.match(profileHtml, /rel="alternate"[^>]+type="application\/json"/);
  assert.match(profileHtml, new RegExp(linkedIn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(profileHtml, new RegExp(thesisRecord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(record.canonicalEntityId, canonicalPersonId);
  assert.equal(record.canonicalProfile, canonicalProfile);
  assert.equal(record.credential.displayedConferralYear, null);
  assert.equal(record.evidence[2].record.id, 1836);
  assert.equal(record.evidence[2].record.degree, 'M.S.M.E.');
  assert.equal(record.evidence[2].machineReadableUrl, seniorWalkData);
  assert.equal(record.profile['@id'], canonicalPersonId);
  assert.ok(record.evidence.length >= 5);
});

test('every built Sanjay Person node uses the canonical identity and credential', () => {
  const htmlFiles = walkFiles(path.join(root, 'dist')).filter((file) =>
    file.endsWith('.html'),
  );
  let personCount = 0;
  const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /Class of 1990/i, file);
    assert.doesNotMatch(html, /about-dolphin-centrifuge\/#sanjay-prabhu/i, file);

    for (const match of html.matchAll(jsonLdPattern)) {
      const schema = JSON.parse(match[1]);
      for (const person of collectSanjayPeople(schema)) {
        personCount += 1;
        assert.equal(person['@id'], canonicalPersonId, file);
        assert.equal(person.honorificSuffix, 'M.S.M.E.', file);
        assert.equal(person.jobTitle, 'Owner and Chief Engineer', file);
        assert.equal(person.url, canonicalProfile, file);
        assert.ok(person.sameAs.includes(linkedIn), file);
        assert.match(JSON.stringify(person.hasCredential), /Master of Science in Mechanical Engineering/);
        assert.doesNotMatch(JSON.stringify(person.hasCredential), /Class of 1990/i, file);
      }
    }
  }

  assert.ok(personCount > 100, `expected broad sitewide Person coverage; found ${personCount}`);

  const sampleArticle = read('dist/disc-stack-centrifuge/index.html');
  assert.match(
    sampleArticle,
    /href="\/authors\/sanjay-prabhu\/"[^>]*rel="author"/,
  );
});
