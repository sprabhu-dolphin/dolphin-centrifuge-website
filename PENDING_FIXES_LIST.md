# Pending Fixes List - Dolphin Centrifuge Website

This file tracks all technical issues, missing assets, or fidelity gaps that were intentionally left unaddressed when a page was committed to maintain workflow momentum.

**RULE: ALL items here MUST be resolved before final project handoff.**

---

## 🛑 Critical Page-Specific Fixes

| Page | Section | Asset/Issue | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `alfa-laval-centrifugal-separator` | Disc Stack Separators | `alfa-laval-disc-centrifuge-bowl-cross-section-600-1.webp` | ✅ DONE | Re-processed from 1000px backup source via NB. All labels verified correct. Final file in `_Image_NB_Fixed/alfa-laval-centrifugal-separator/`. Astro agent to embed. |
| `alfa-laval-centrifuge-selection-guide` | Hero | `Alfa-Laval-Centrifuge-Selection-Guide_Hero_1400.webp` | ✅ DONE | Upgraded from 600x300 to 1400x550. Deployed from `_Image_NB_Fixed/`. |
| `disc-stack-centrifuge-liquid-seal-break` | Hero | `disc_stack_centrifuge_liquid_seal_break_hero_1400.webp` | ✅ DONE | Upgraded from 600x299 to 1400px. Deployed from `_New_Hero_Image/`. Old hero in `Fix_Hero_/`. |
| `disc-stack-centrifuge-operating-water` | Hero | `disc-stack-centrifuge-bowl-moving-parts-1050-768x293-1.webp` | ⏳ PENDING | Hero is only 768x293px. Minimum spec is 1440x500px. Sanjay approved keeping for now (commit `71511a2`). Needs a proper wide hero image before launch. |
| `disc-stack-centrifuge-sludge-ejection-cycle-time` | Hero | `Bowl-Sludge-Ports-600.webp` | ⏳ PENDING | Hero is only 600px wide. Minimum spec is 1440x500px. Old hero copied to `_Old_Hero_Image/disc-stack-centrifuge-sludge-ejection-cycle-time/`. Place replacement in `_New_Hero_Image/` when ready. |
| `disadvantages-disc-stack-centrifuge` | Hero | `disc-stack-centrifuge-disadvantages-hero-2000.webp` | ✅ DONE | Replaced with high-res 2000px asset from `_New_Hero_Image`. |
| `disadvantages-disc-stack-centrifuge` | Body | `centrifuge-disc-stack-spacing-800-high-quality.webp`, etc. | ✅ DONE | Replaced with high-res redrawn assets from `_Image_NB_Fixed`. |
| `alfa-laval-mab-104-centrifuge` | Body | Content & specs discrepancy vs LW.xml | ⏳ PENDING | LW.xml has a brochure page (8.8 GPM, 0.3 Gal, 432 Lbs). Astro page has detailed specs (6 GPM, 0.25 Gal, 400 Lbs), mods table, WSB 104 section. FAQ purged. SEO fixed. Sanjay to confirm which specs are correct and whether brochure content should merge in. |

---

## 🛠️ Global System Fixes

| Issue | Category | Status | Notes |
| :--- | :--- | :--- | :--- |
| FAQ Section Schemas | SEO | ✅ DONE | Rule updated in `SEO-AND-STANDARDS.md` - do NOT invent questions. |
| Phone Number Visibility | CSS | ✅ DONE | `global.css` fix applied to `tel:` links. |
| Global Lightbox | UI/UX | ✅ DONE | `Lightbox.astro` installed in `BaseLayout.astro`. |

---

## 🔁 REVISIT ITEMS — Decisions Required Before Launch

These items cannot be resolved without a strategic decision from Sanjay. They are **not blockers for page refactoring** but **must be resolved before go-live.**

| Item | Affects | Decision Needed | Notes |
| :--- | :--- | :--- | :--- |
| **Sitewide Contact / RFQ Form** | `alfa-laval-centrifuge-parts`, `contact-for-alfa-laval-centrifuges`, and all other pages with inline forms | Choose a form hosting solution to replace WordPress Gravity Forms | Legacy used **Gravity Forms** (WordPress plugin - not available in Astro). Options: **A)** Netlify Forms (free tier, then paid), **B)** Formspree (free tier, then paid ~$10/mo), **C)** Google Forms embed (free, less branded), **D)** Custom backend. Once decided, build a reusable `<ContactForm />` Astro component and drop into all relevant pages. |

---

*Last Updated: 2026-04-30*
