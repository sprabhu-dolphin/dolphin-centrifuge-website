# TAKEOVER_SPEC

## Purpose

Set a controlled takeover process for this repository so legacy fidelity is preserved before improvements.

## Source of truth

- Legacy WordPress pages are the source of truth for structure, intent, and core on-page content.

## Repo/branch rules

- Use this existing repo only: `sprabhu-dolphin/dolphin-centrifuge-website`.
- `master` remains the main deployment branch.
- Work happens in controlled branches, starting with `takeover-fidelity`.

## Non-negotiables

- No invented FAQs, summary boxes, or technical claims.
- No URL or page title changes unless approved in `CHANGE_NOTES.md`.
- Every legacy page should eventually have a contract file in `contracts/legacy/`.

## Validation goals

- CI should block obvious fidelity violations before merge.
- Initial checks will cover title, heading structure, internal links, images/alt text, schema, FAQ bans, and redirects.

## What not to do yet

- Do not perform broad rewrites.
- Do not change published page copy, slugs, or metadata without approved decision records.
