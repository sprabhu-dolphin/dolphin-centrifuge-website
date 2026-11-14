#!/usr/bin/env node
/**
 * Compare two builds' public data files and prove the published figures held.
 *
 *   node scripts/compare-public-data.mjs <beforeDist> <afterDist> [file ...]
 *
 * Default files: specs.json, technical-data/centrifuges.v1.json and every other
 * JSON file under technical-data/. For each file it walks both trees and sorts
 * every difference into:
 *
 *   removed keys    a key present before and absent after, counted by key name
 *   removed items   array entries present before and absent after
 *   added           anything new after (expected: none)
 *   changed values  a leaf whose value differs (expected: none beyond the
 *                   ones listed with --allow "old=>new")
 *
 * `generated` timestamps are ignored. Exit code 1 if anything is added or a
 * value changes without an --allow entry.
 *
 * Plain node, no dependencies.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const allow = new Map();
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--allow') {
    const [from, to] = args[++i].split('=>');
    allow.set(from, to);
  } else positional.push(args[i]);
}
const [beforeDir, afterDir, ...only] = positional;
if (!beforeDir || !afterDir) {
  console.error('usage: node scripts/compare-public-data.mjs <beforeDist> <afterDist> [--allow "old=>new"] [file ...]');
  process.exit(2);
}

const IGNORED_KEYS = new Set(['generated']);

function defaultFiles() {
  const dir = path.join(afterDir, 'technical-data');
  const data = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).map((name) => `technical-data/${name}`);
  return ['specs.json', ...data.sort()];
}

/** Text with every allowed replacement applied, so a value that only differs by an allowed edit compares equal. */
const applyAllowed = (text) => [...allow].reduce((out, [from, to]) => out.split(from).join(to), text);

function compare(before, after, at, report) {
  if (Array.isArray(before) && Array.isArray(after)) {
    // Arrays of objects with ids compare by id; everything else by serialized value.
    const keyOf = (item) => (item && typeof item === 'object' && 'id' in item ? `id:${item.id}` : JSON.stringify(item));
    const afterByKey = new Map(after.map((item) => [keyOf(item), item]));
    const beforeKeys = new Set(before.map(keyOf));
    for (const item of before) {
      const key = keyOf(item);
      if (afterByKey.has(key)) {
        if (typeof item === 'object' && item !== null) compare(item, afterByKey.get(key), `${at}[${key}]`, report);
        continue;
      }
      // A primitive entry that only differs by an allowed edit is a change, not a removal.
      if (typeof item === 'string' && after.includes(applyAllowed(item))) {
        report.allowedChanges.push({ at, before: item, after: applyAllowed(item) });
        beforeKeys.add(JSON.stringify(applyAllowed(item)));
        continue;
      }
      if (typeof item === 'object' && item !== null && before.length === after.length) {
        const index = before.indexOf(item);
        compare(item, after[index], `${at}[${index}]`, report);
        beforeKeys.add(keyOf(after[index]));
        continue;
      }
      report.removedItems.push({ at, item });
    }
    for (const item of after) if (!beforeKeys.has(keyOf(item))) report.added.push({ at, item });
    return;
  }
  if (before && after && typeof before === 'object' && typeof after === 'object') {
    for (const key of Object.keys(before)) {
      if (IGNORED_KEYS.has(key)) continue;
      if (!(key in after)) {
        report.removedKeys.set(key, (report.removedKeys.get(key) ?? 0) + 1);
        report.removedExamples.set(key, report.removedExamples.get(key) ?? `${at}.${key}`);
        continue;
      }
      compare(before[key], after[key], `${at}.${key}`, report);
    }
    for (const key of Object.keys(after)) if (!(key in before)) report.added.push({ at: `${at}.${key}`, item: after[key] });
    return;
  }
  if (JSON.stringify(before) === JSON.stringify(after)) {
    report.identicalLeaves++;
    return;
  }
  if (typeof before === 'string' && applyAllowed(before) === after) {
    report.allowedChanges.push({ at, before, after });
    return;
  }
  report.changed.push({ at, before, after });
}

let failed = false;
const totals = { removedKeys: new Map(), files: 0 };
for (const file of only.length ? only : defaultFiles()) {
  const read = (dir) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const report = {
    removedKeys: new Map(), removedExamples: new Map(), removedItems: [], added: [], changed: [], allowedChanges: [], identicalLeaves: 0,
  };
  compare(read(beforeDir), read(afterDir), '$', report);
  totals.files++;
  for (const [key, count] of report.removedKeys) totals.removedKeys.set(key, (totals.removedKeys.get(key) ?? 0) + count);
  const sizes = [beforeDir, afterDir].map((dir) => fs.statSync(path.join(dir, file)).size);
  const noisy = report.removedKeys.size || report.removedItems.length || report.added.length || report.changed.length || report.allowedChanges.length;
  if (!noisy) continue;
  console.log(`\n${file}  (${sizes[0]} -> ${sizes[1]} bytes, ${report.identicalLeaves} identical leaf values)`);
  for (const [key, count] of report.removedKeys) console.log(`  removed key  ${key} x${count}   e.g. ${report.removedExamples.get(key)}`);
  for (const { at, item } of report.removedItems) console.log(`  removed item ${at}: ${JSON.stringify(item).slice(0, 140)}`);
  for (const { at, before, after } of report.allowedChanges) console.log(`  allowed edit ${at}: ${JSON.stringify(before).slice(0, 90)} -> ${JSON.stringify(after).slice(0, 90)}`);
  for (const { at, item } of report.added) console.log(`  ADDED        ${at}: ${JSON.stringify(item).slice(0, 140)}`);
  for (const { at, before, after } of report.changed) console.log(`  CHANGED      ${at}: ${JSON.stringify(before).slice(0, 90)} -> ${JSON.stringify(after).slice(0, 90)}`);
  if (report.added.length || report.changed.length) failed = true;
}

console.log(`\n${totals.files} files compared. Removed keys by name: ${[...totals.removedKeys].map(([k, n]) => `${k}=${n}`).join(', ') || 'none'}.`);
console.log(failed ? 'FAIL: values were added or changed.' : 'OK: no published value was added or changed.');
process.exit(failed ? 1 : 0);
