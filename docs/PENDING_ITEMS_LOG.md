# PENDING ITEMS LOG

This file tracks known issues and unfinished work across all pages.
Return to these items in a future session.

---

## alfa-laval-centrifuge-parts

| # | Issue | Priority | Notes |
|---|---|---|---|
| 1 | **RFQ Form is missing** — currently a styled CTA button, not a real form | 🔴 High | Legacy had a full parts RFQ form (Name, Email, Phone, Company, Part Number, Description, Quantity). Needs a real contact/form solution. |
| 2 | **Sidebar nav glossary link slug** — `relatedApplications` uses `/disc-centrifuge-parts-glossary/` but body text uses `/disc-centrifuge-glossary/` | 🟡 Medium | Confirm which slug is live, then fix the sidebar to match. |

---

## ✅ COMPLETED — 2026-04-19 — Contact Form CRM System

| # | Item | Status |
|---|---|---|
| 1 | **Cloudflare D1 database** — `dolphin-submissions` — all form entries saved automatically | ✅ DONE |
| 2 | **Admin dashboard** — `/admin/submissions/` — password protected, no-index, clean table | ✅ DONE |
| 3 | **Reconnect detection** — new entry matched against DB by email/phone/company → alert email fires | ✅ DONE |
| 4 | **Delete with confirmation modal** — styled modal, row removed from DB and dashboard instantly | ✅ DONE |
| 5 | **Green success toast** — 3-second countdown bar, auto-dismiss, manual × close | ✅ DONE |
| 6 | **Smart redirect after submit** — fluid type keyword matched to 22 product pages; fallback to `/picking-the-right-industrial-centrifuge/` | ✅ DONE |
| 7 | **"Other" country field** — free-text country input revealed on select; US State disabled + cleared | ✅ DONE |
| 8 | **Required field highlighting** — missed fields turn red border on submit; clears on type | ✅ DONE |
| 9 | **Autofill bug fixed** — `autocomplete="off"` on all application fields to block Chrome geo-fill | ✅ DONE |
| 10 | **FAQ edits** — 5 content corrections per annotated screenshot | ✅ DONE |
| 11 | **Solids field** — renamed "by Weight" → "by Volume", made optional | ✅ DONE |

---
