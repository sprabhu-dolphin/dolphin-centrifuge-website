#!/usr/bin/env node

// Google Ads GATED write helper — NARROW SCOPE: conversion_action status / primary_for_goal only.
// SAFETY: default is VALIDATE-ONLY (no change). You must pass --apply to actually mutate.
// Separate from the read-only google-ads-check.mjs by design (do not merge the two).
// Reuses the same out-of-repo creds under %APPDATA%/gcloud.

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const apiVersion = 'v24';
const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const gcloudDir = path.join(appDataDir, 'gcloud');
const clientPath = path.join(gcloudDir, 'dolphin-ga4-gtm-readonly-codex-oauth-client.json');
const tokenPath = path.join(gcloudDir, 'dolphin-google-ads-token.json');
const configPath = path.join(gcloudDir, 'dolphin-google-ads-config.json');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) { args._.push(item); continue; }
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) { args[key] = true; } else { args[key] = next; i += 1; }
  }
  return args;
}

async function readJson(p) { return JSON.parse((await fs.readFile(p, 'utf8')).replace(/^﻿/, '')); }

async function readClient() {
  const raw = await readJson(clientPath);
  const c = raw.installed || raw.web;
  if (!c?.client_id || !c?.client_secret) throw new Error('OAuth client missing id/secret');
  return { clientId: c.client_id, clientSecret: c.client_secret, tokenUri: c.token_uri || 'https://oauth2.googleapis.com/token' };
}

async function accessToken() {
  if (!existsSync(tokenPath)) throw new Error('Ads OAuth token not found');
  const token = await readJson(tokenPath);
  const client = await readClient();
  const body = new URLSearchParams({
    client_id: client.clientId, client_secret: client.clientSecret,
    refresh_token: token.refresh_token, grant_type: 'refresh_token',
  });
  const res = await fetch(token.token_uri || client.tokenUri, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`token refresh failed: ${JSON.stringify(j)}`);
  return j.access_token;
}

async function readConfig() {
  const cfg = await readJson(configPath);
  if (!cfg.developer_token) throw new Error('config missing developer_token');
  return cfg;
}

function norm(v) { return String(v || '').replace(/\D/g, ''); }

async function convMutate(args) {
  const resource = args.resource;
  if (!resource) throw new Error('Missing --resource customers/<cid>/conversionActions/<id>');
  const m = resource.match(/customers\/(\d+)\/conversionActions\/(\d+)/);
  if (!m) throw new Error('Bad --resource format');
  const customerId = norm(args['customer-id'] || m[1]);
  const cfg = await readConfig();
  const loginCustomerId = norm(args['login-customer-id'] || cfg.login_customer_id);
  const apply = Boolean(args.apply);

  const update = { resourceName: resource };
  const maskFields = [];
  if (args.status) { update.status = String(args.status).toUpperCase(); maskFields.push('status'); }
  if (args.primary !== undefined) {
    update.primaryForGoal = String(args.primary) === 'true';
    maskFields.push('primary_for_goal');
  }
  if (!maskFields.length) throw new Error('Nothing to change: pass --status and/or --primary');

  const payload = {
    operations: [{ updateMask: maskFields.join(','), update }],
    validateOnly: !apply,
    responseContentType: 'MUTABLE_RESOURCE',
  };

  const at = await accessToken();
  const url = `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/conversionActions:mutate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${at}`,
      'developer-token': cfg.developer_token,
      'login-customer-id': loginCustomerId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  const mode = apply ? 'APPLIED' : 'VALIDATE-ONLY';
  if (!res.ok) {
    console.log(`[${mode}] HTTP ${res.status} on ${resource} (${maskFields.join(',')})`);
    console.log(JSON.stringify(json, null, 2).slice(0, 1800));
    process.exitCode = 1;
    return;
  }
  console.log(`[${mode}] OK ${resource} → ${maskFields.map((f) => f + '=' + (f === 'status' ? update.status : update.primaryForGoal)).join(', ')}`);
  if (json.results) console.log(JSON.stringify(json.results, null, 2).slice(0, 800));
}

async function convCreate(args) {
  const cfg = await readConfig();
  const customerId = norm(args['customer-id'] || cfg.customer_id);
  const loginCustomerId = norm(args['login-customer-id'] || cfg.login_customer_id);
  const apply = Boolean(args.apply);
  if (!args.name || !args.type) throw new Error('Need --name and --type (e.g. AD_CALL)');
  const create = {
    name: args.name,
    type: String(args.type).toUpperCase(),
    category: String(args.category || 'DEFAULT').toUpperCase(),
    status: String(args.status || 'ENABLED').toUpperCase(),
    primaryForGoal: args.primary === undefined ? true : String(args.primary) === 'true',
    valueSettings: { defaultValue: Number(args.value || 0), alwaysUseDefaultValue: true },
  };
  if (args['call-duration']) create.phoneCallDurationSeconds = String(args['call-duration']);
  if (args.counting) create.countingType = String(args.counting).toUpperCase();
  const payload = { operations: [{ create }], validateOnly: !apply, responseContentType: 'MUTABLE_RESOURCE' };

  const at = await accessToken();
  const url = `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/conversionActions:mutate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${at}`,
      'developer-token': cfg.developer_token,
      'login-customer-id': loginCustomerId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  const mode = apply ? 'APPLIED' : 'VALIDATE-ONLY';
  if (!res.ok) {
    console.log(`[${mode}] HTTP ${res.status} creating ${create.type}/${create.category}`);
    console.log(JSON.stringify(json, null, 2).slice(0, 2200));
    process.exitCode = 1;
    return;
  }
  console.log(`[${mode}] OK created ${create.type} "${create.name}" (category=${create.category}, primary=${create.primaryForGoal}, dur=${create.phoneCallDurationSeconds || 'n/a'}s)`);
  if (json.results) console.log(JSON.stringify(json.results, null, 2).slice(0, 800));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'help';
  if (args.help || cmd === 'help') {
    console.log(`Gated Ads write helper (conversion_action only).
  node google-ads-write.mjs conv --resource <res> --status ENABLED|REMOVED [--primary true|false] [--apply]
  node google-ads-write.mjs create --name "..." --type AD_CALL --category PHONE_CALL_LEAD [--call-duration 60] [--counting ONE_PER_CLICK] [--primary true] [--apply]
  Default = VALIDATE-ONLY. Add --apply to actually change it.`);
    return;
  }
  if (cmd === 'conv') return convMutate(args);
  if (cmd === 'create') return convCreate(args);
  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
