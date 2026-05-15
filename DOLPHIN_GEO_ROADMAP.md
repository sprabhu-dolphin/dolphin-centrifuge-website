# Dolphin Centrifuge — GEO/AEO Audit & Implementation Roadmap

**For:** Astro Cloud agent (and Sanjay)
**Scope:** Three audited pages — `industrial-centrifuge.astro`, `waste-oil-centrifuge.astro`, `decanter-centrifuge-optimization.astro` — and a system-wide rollout plan for all ~150 pages.
**Goal:** Make Dolphin Centrifuge the most-cited authoritative source for industrial centrifuge questions across ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews.

> **CURRENT AUTHOR-SIGNAL OVERRIDE (May 2026):** Sanjay clarified that author trust signals should default to background schema, not visible visitor-facing bylines or review lines. Page schema should identify Sanjay Prabhu MSME with truthful credentials, role, and experience where supported by site identity. Do not add visible author bylines, reviewed-by lines, headshots, or author bio blocks unless Sanjay explicitly asks for visible author treatment on that page.

Default pass-on language: Add schema-only author enrichment. Do not add any visible author or reviewed-by text. In Article schema, identify the author as Sanjay Prabhu MSME with truthful background details where supported by site identity: name: Sanjay Prabhu MSME; role/title: Founder and Chief Engineer, Dolphin Centrifuge, or the existing site-consistent title; worksFor: Dolphin Centrifuge; description: 40+ years of specialized experience in industrial centrifuge systems; url: use the existing Dolphin about page unless a dedicated author page exists.

> **POLICY UPDATE (May 2026) — REVISION 2:** The earlier rule requiring Dolphin nomenclature (DMPX-XXX, DMB-XXX) on customer-facing pages has been **reversed**. Alfa Laval model names (MOPX, WHPX, NX-series, BTPX, BRPX, P3, G2, etc.) are now used everywhere for global recognition and AI entity matching. All recommendations in this roadmap reflect this updated policy. See Appendix A for the full rationale.

Default hidden education credential: include background-only `alumniOf` and `hasCredential` details for Sanjay Prabhu MSME where author schema is being enriched. Use `Article.author` when Article schema exists. If there is no Article schema, use `WebPage.author`; do not create Article schema only to carry author data. Credential text: Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990. Do not add visible degree, school, class year, author, or reviewed-by text unless Sanjay explicitly asks for visible author treatment.

Retroactive page rule: pages already passed before this credential policy still need a narrow hidden-schema-only supplemental pass. Do not reopen content, images, layout, captions, CTAs, links, or visible text during that supplemental pass unless Codex explicitly assigns that separate issue.

Default quick link check for all future Astro instructions: check internal href links in the selected page file only; verify each internal target exists as a source page route or in `public/_redirects`; verify same-page anchor links match real element IDs; fix obvious broken or label/href-mismatched page-local links found in that file; do not run a full-site crawl; do not validate every external URL unless it is visibly malformed.

---

## 0. Executive Summary

You already have the foundation most competitors don't: real performance data, application depth, JSON-LD schemas, an FAQ section, a TOC, a layout system, and an `author` object pointing to "Sanjay Prabhu MSME." That puts you ahead of Trucent, Centrifuges Unlimited, and Handex on raw content.

The gaps are in **how** that content is exposed to AI engines. Specifically:

| # | Gap | Severity | Effort |
|---|-----|----------|--------|
| 1 | Author E-E-A-T invisible to humans (only in schema, never rendered) | HIGH | LOW |
| 2 | `dateModified` missing or stale (`2021-03-01` published, no modified date) — AI engines deprioritize content older than 12 months | HIGH | LOW |
| 3 | No `llms.txt` at site root | HIGH | LOW |
| 4 | Brand nomenclature inconsistency — mixed DMPX and Alfa Laval naming. Per current policy, standardize on **Alfa Laval WHPX-series** as the primary recommendation (current production, partial discharge); reference legacy MOPX/MAPX only as schema aliases for entity matching | HIGH | MEDIUM |
| 5 | Missing schema types: `HowTo`, `VideoObject`, `BreadcrumbList`, `Organization` (at root) | HIGH | LOW |
| 6 | No "key takeaway" answer capsule (first 40–60 words) — AI engines extract those verbatim | HIGH | LOW |
| 7 | No `sameAs` linking author to LinkedIn / Wikidata / professional registry | MEDIUM | LOW |
| 8 | Product schema offers section has empty `seller: {}` and no price range | MEDIUM | LOW |
| 9 | FAQ typo: `"a75 dB"` → `"75 dB"` (live on page, in schema) | MEDIUM | TRIVIAL |
| 10 | Comment encoding artifacts in `industrial-centrifuge.astro` (`â•â•` instead of `═══`) — cosmetic but signals stale code | LOW | TRIVIAL |
| 11 | Factual error in decanter file line 175: "In summary, a deeper pond leads to:" — but the bullets describe SHALLOW pond outcomes | MEDIUM | TRIVIAL |
| 12 | YouTube embed has no `VideoObject` schema | MEDIUM | LOW |

The good news: **most of these are template-level fixes.** Once you fix `ApplicationLayout.astro` and add 5–6 reusable Astro components, every one of your 150 pages gets the benefit automatically.

---

## 1. Per-File Audit Findings

### 1A. `industrial-centrifuge.astro` (Pillar product page)

**What's working:**
- Three schemas: `Product`, `Article`, `FAQPage` ✅
- Author identity in schema (`Sanjay Prabhu MSME`) ✅
- 9 FAQ items with good answers ✅
- Capacity, size, and OEM comparison tables ✅
- Strong internal linking ✅
- Pricing data present (`$30K`, `$50K`, `$1M`) ✅

**Critical gaps:**

1. **`Article.datePublished: "2021-03-01"` with no `dateModified`.** This page reads to AI crawlers as 5 years stale. Fix: add `dateModified` and update it on every content change. (Even better: derive it from git commit time at build.)

2. **Brand nomenclature inconsistency — standardize on Alfa Laval names.** Under the current policy, Alfa Laval model names (MOPX, WHPX, NX-series, BTPX, BRPX, etc.) stay on customer-facing pages for global recognition. The mixed naming on this page should resolve **toward** Alfa Laval, not away from it. Specifically:
   - Row 1: `DMPX-028` → change to the current Alfa Laval equivalent: **`Alfa Laval WHPX-407`** (partial-discharge, current production at the ~30 GPM tier). Reference the legacy MOPX-207 as a `Product.alternateName` only.
   - Rows 2–4: `Alfa Laval WHPX 513`, `Alfa Laval NX-314`, `Alfa Laval NX-418` ✅ — these are already correct
   - Figcaption line 310: `"Alfa Laval WHPX-513 Centrifuge for Wastewater"` ✅ — correct
   
   AI engines crawl the literal page text. When ChatGPT learns "Alfa Laval WHPX-513," it associates that globally recognized model with your page — which is exactly what you want now. Consistent Alfa Laval naming across all 150 pages builds the entity association at scale. The earlier "replace Alfa Laval with DMPX" rule is obsolete — disregard any prior guidance pointing in that direction.

3. **No author byline visible to users.** Schema says you're the author. The page never says it. Humans build trust from seeing "by Sanjay Prabhu, MSME — 40+ years in centrifuge engineering" with a photo. AI engines that summarize the page also pick up on author trust signals when they're in the visible DOM, not just buried in JSON-LD. (The `decanter-centrifuge-optimization.astro` file already does this correctly at line 405. Apply it everywhere.)

4. **FAQ answer typo (line 20):** `"a75 dB"` → `"75 dB"`. This is in both the rendered page AND the FAQPage schema, so it's being indexed wrong.

5. **Product schema `offers` block has empty `seller: {}` and no price.** Schema.org expects either `price`, `priceRange`, or `priceSpecification`. Without that, AI engines can't answer "how much does a Dolphin disc-stack centrifuge cost?" with a citation to your page. Even a range — `priceRange: "$30,000 - $300,000"` — is better than nothing.

6. **Encoding artifacts in HTML comments (lines 138, 154, 212, etc.):** `<!-- â•â• ... â•â• -->` — these were `═══` originally and got corrupted somewhere in the pipeline. Search-replace fix.

7. **No `BreadcrumbList` schema** (assuming it's not in the layout — verify).

8. **No `Organization` schema at the root** (homepage / layout level) — this is what defines "Dolphin Centrifuge" as a citable entity across all pages.

9. **No "key takeaway" answer capsule** — the first paragraph is good but doesn't read like a 40–60 word direct answer that AI can lift verbatim. Add one above the TOC.

10. **No `wordCount`, `articleSection`, or `mainEntityOfPage`** on the Article schema (small but standard).

---

### 1B. `waste-oil-centrifuge.astro` (Application + product hybrid — your most important page)

**What's working:**
- Beautifully structured with 16 sections in TOC ✅
- Real "before/after" performance data table with specific numbers ✅
- Packaged systems spec table (currently DMPX-014, DMPX-028, DMPX-070 — needs migration to Alfa Laval naming under the new policy)
- ProductCard components with full specs ✅
- 9 FAQ items ✅
- YouTube pilot test video embedded ✅
- Process flow steps with numbered list ✅

**Critical gaps:**

1. **`Article` schema is missing BOTH `datePublished` AND `dateModified`.** Worse than industrial-centrifuge.astro. AI engines treat undated content as low-trust.

2. **Brand nomenclature is split-personality — resolve TOWARD Alfa Laval.** Under the current policy, Alfa Laval naming is preferred for global recognition. This page mixes both:
   - Spec table header (line 554–555): `MOPX 207`, `MOPX 210` ✅ — these are correct, keep
   - Performance table (line 246): `"Alfa Laval MOPX-207 Performance Data"` ✅ — correct, keep
   - ProductCard titles (lines 821, 837, 853): `Alfa Laval WHPX 405`, `Alfa Laval MOPX 213`, `Alfa Laval WHPX 513` ✅ — correct, keep
   - Packaged Systems table (lines 408–410): `DMPX-014`, `DMPX-028`, `DMPX-070` ❌ — **change to the current-production Alfa Laval equivalents**: `WHPX-405`, `WHPX-407`, and `WHPX-513` respectively (all partial-discharge, current production). The legacy MOPX/MAPX full-discharge equivalents (MOPX-205/207/213, MAPX-313) are end-of-life and should not be the primary recommendation; reference them only as legacy aliases in `Product.alternateName` schema. See the cross-reference table in Appendix C for the complete mapping and discharge-type rationale.
   
   The split-personality is the problem; the direction of resolution is **toward Alfa Laval**, not away from it. Same goes for the toc/labels and any related-products lists on the page. AI engines reward consistent entity references — when every page says "Alfa Laval MOPX-207" the same way, the entity gets reinforced and Dolphin becomes the citable supplier of record.

3. **Related Products links don't match labels** (line 132): label says `"Alfa Laval MOPX 213"` but `href` is `/alfa-laval-mopx-209-centrifuge/`. AI crawlers flag this as low-quality/spam-adjacent.

4. **No `VideoObject` schema** for the YouTube embed. This is a huge missed opportunity — `VideoObject` with `contentUrl`, `embedUrl`, `description`, `uploadDate`, `duration` makes the video itself eligible to appear in AI answers for "show me a centrifuge processing waste oil" queries.

5. **No author byline visible.** Same issue as industrial-centrifuge.astro.

6. **The Process Flow section (lines 774–798) is literally a 3-step procedure** — perfect `HowTo` schema candidate. Currently rendered as a plain `<ol>` with no structured data.

7. **Performance Results section** has gold-standard data (Sediment, Water, Vanadium, Aluminum, Silicon, Ash before/after) but no `Dataset` schema. AI engines specifically scan for `Dataset` schema to answer "what kind of removal efficiency does a disc-stack centrifuge achieve on used motor oil?"

8. **`ProductCard` specs aren't reflected in the page-level Product schema.** The schema describes generic "Waste Oil Centrifuge Systems" — but each ProductCard is itself a distinct Product offering. Should emit a `Product` per card with `aggregateOffer` at the page level.

9. **Blockquote on line 754** has a quote with no attribution — `cite` attribute missing, no author. AI engines pick up on attributed quotes vastly more than orphaned ones.

10. **Performance numbers buried in tables aren't easily extractable as citable passages.** Add a 1-sentence "answer capsule" above the table: *"A Dolphin centrifuge typically reduces used motor oil sediment from 0.42% to 0.06% by weight, water from 38.0% to 1.2% by volume, and ash from 1.17% to 0.09% by weight."* AI engines will lift this verbatim.

---

### 1C. `decanter-centrifuge-optimization.astro` (Knowledge base article)

**What's working:**
- BEST author E-E-A-T treatment of the three files — visible byline at line 405 ✅
- Article schema with both `datePublished` AND `dateModified` ✅
- Excellent diagrammatic content with proper figcaptions ✅
- Tightly scoped, 5-point structure ✅

**Critical gaps:**

1. **Factual/copy error on line 175:** Heading says *"In summary, a deeper pond leads to:"* but it's inside the Shallow Pond section and the bullets describe shallow pond effects. Fix to *"In summary, a shallow pond leads to:"*.

2. **The article is literally titled "5 Ways to Optimize..." but has NO `HowTo` schema.** Title format "N ways to..." is one of the highest-citation patterns for AI answers. With `HowTo` schema, you become the source for "how do I optimize decanter performance?" queries.

3. **No FAQPage schema** despite the Summary section literally listing 6 questions (lines 79–86) the article answers. Convert those 6 to FAQPage items, OR add a separate Q&A block at the bottom.

4. **No "Adjusting" parameter tables.** The Auger Pitch section (lines 360–383) has a clean comparison table — but Pond Depth, Bowl Speed, and Auger Speed sections only have prose. AI engines pull tables 10x more reliably than prose for parameter ranges.

5. **No "Key Takeaway" / TL;DR capsule** in extractable answer-block format.

6. **Author byline is text-only** — no photo, no `Person.image`, no `sameAs` to LinkedIn. AI engines weigh visible author photos as an E-E-A-T signal.

---

## 2. The Reusable Astro Component Library

This is the **deliverable for your Cloud agent.** Build these 8 components once, drop them across all 150 pages. Each one closes specific GEO gaps and renders consistently.

### 2.1 `<AuthorByline />` — TOP of every content page

Replaces the bottom-of-page italic line that only exists on the decanter file. Goes near the H1 where humans AND AI engines see it first.

```astro
---
// src/components/AuthorByline.astro
export interface Props {
  author?: string;          // default: 'Sanjay Prabhu MSME'
  role?: string;            // default: 'Founder & Chief Engineer'
  experience?: string;      // default: '40+ years'
  reviewedDate?: string;    // ISO date, e.g. '2026-05-12'
  photoUrl?: string;        // default: '/images/team/sanjay-prabhu-headshot.webp'
}
const {
  author = 'Sanjay Prabhu, MSME',
  role = 'Founder & Chief Engineer, Dolphin Centrifuge',
  experience = '40+ years in industrial centrifuge engineering',
  reviewedDate,
  photoUrl = '/images/team/sanjay-prabhu-headshot.webp',
} = Astro.props;

const formattedDate = reviewedDate
  ? new Date(reviewedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : null;
---

<div class="flex items-center gap-4 py-4 border-y border-gray-100 my-6">
  <img
    src={photoUrl}
    alt={`${author}, ${role}`}
    width="56" height="56"
    loading="eager"
    class="w-14 h-14 rounded-full object-cover border-2 border-gold"
  />
  <div class="flex-1">
    <p class="text-sm font-semibold text-navy leading-tight">
      Written and reviewed by <a href="/about/sanjay-prabhu/" class="underline decoration-gold/40 hover:decoration-gold">{author}</a>
    </p>
    <p class="text-xs text-text-light">{role} · {experience}</p>
    {formattedDate && (
      <p class="text-xs text-text-muted mt-1">
        <span class="font-semibold">Last reviewed:</span> <time datetime={reviewedDate}>{formattedDate}</time>
      </p>
    )}
  </div>
</div>
```

**Why this matters for AI:** Visible author + photo + credentials + last-reviewed date is the single strongest E-E-A-T signal. ChatGPT and Perplexity actively favor pages with this exact pattern. The `<time datetime="">` element is what crawlers read.

---

### 2.2 `<KeyTakeaway />` — The answer capsule (134–167 words, citation-ready)

This is the single highest-ROI component. Every AI engine looks for a self-contained ~150-word block near the top that directly answers the page's question. AI lifts these *verbatim* into responses.

```astro
---
// src/components/KeyTakeaway.astro
export interface Props {
  title?: string;
}
const { title = 'Key Takeaway' } = Astro.props;
---

<aside class="not-prose bg-gradient-to-br from-navy/5 to-gold/5 border-l-4 border-gold rounded-r-xl p-6 my-6"
       aria-label={title}>
  <p class="text-xs font-bold uppercase tracking-widest text-gold-dark mb-2">{title}</p>
  <div class="text-base text-navy/90 leading-relaxed prose-dolphin">
    <slot />
  </div>
</aside>
```

**Authoring rules** (give these to anyone writing content):
- 134–167 words. Hard ceiling 200. Hard floor 100.
- Lead with the entity being defined ("A waste oil centrifuge is...")
- Pack in 3–5 specific numbers, units, or named models
- One sentence per claim; no compound paragraphs
- End with a "what this means" line

**Example for the waste oil page:**

> A waste oil centrifuge is a continuous disc-stack separator that generates up to 12,000 Gs of centrifugal force to remove sediment, water, and sub-micron particulates from used motor oil, hydraulic oil, and waste vegetable oil. Dolphin Centrifuge supplies turnkey systems built on reconditioned Alfa Laval cores from 3 GPM to 100+ GPM, including the WHPX-405 (5–10 GPM), WHPX-407 (~30 GPM), WHPX-410 (~45 GPM), and WHPX-513 (60 GPM @ 180°F) — all partial-discharge designs for low product loss. In a real-world deployment on used motor oil, our reconditioned Alfa Laval centrifuge reduced sediment from 0.42% to 0.06% by weight, water from 38.0% to 1.2% by volume, and ash content from 1.17% to 0.09% by weight. Self-cleaning three-phase models eject solids automatically, removing the labor and media cost of filtration. Payback periods are typically measured in months for processors handling 500+ gallons per day.

That's 145 words, packed with 12 specific facts (units, models, percentages, recovery numbers, discharge type). AI engines will lift it whole.

---

### 2.3 `<LastUpdated />` — Visible freshness signal

```astro
---
// src/components/LastUpdated.astro
export interface Props {
  date: string;  // ISO format
  showLabel?: boolean;
}
const { date, showLabel = true } = Astro.props;
const formatted = new Date(date).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});
---

<p class="text-xs text-text-muted italic">
  {showLabel && <span class="font-semibold not-italic">Last updated:</span>}
  <time datetime={date}>{formatted}</time>
</p>
```

**Rule:** Every content page gets this above the fold AND in the schema. Refresh every page at least once every 12 months. AI engines actively deprioritize content > 18 months stale on technical topics.

---

### 2.4 `<HowToBlock />` — For procedural content

```astro
---
// src/components/HowToBlock.astro
export interface Props {
  name: string;
  description?: string;
  totalTime?: string;       // ISO 8601 duration, e.g. "PT2H"
  estimatedCost?: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
}
const { name, description, totalTime, estimatedCost, steps } = Astro.props;

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": name,
  ...(description && { "description": description }),
  ...(totalTime && { "totalTime": totalTime }),
  ...(estimatedCost && { "estimatedCost": estimatedCost }),
  "step": steps.map((s, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": s.name,
    "text": s.text,
    ...(s.image && { "image": s.image })
  }))
};
---

<script type="application/ld+json" set:html={JSON.stringify(howToJsonLd)} />

<div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
  <h2 class="text-2xl font-bold text-navy mb-2">{name}</h2>
  {description && <p class="text-text-light mb-6">{description}</p>}
  <ol class="space-y-6">
    {steps.map((step, i) => (
      <li class="flex gap-4">
        <span class="w-8 h-8 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center shrink-0">
          {i + 1}
        </span>
        <div class="flex-1">
          <h3 class="font-bold text-navy mb-1">{step.name}</h3>
          <p class="text-text-light text-sm">{step.text}</p>
          {step.image && (
            <img src={step.image} alt={step.name} loading="lazy" class="mt-3 rounded-lg" />
          )}
        </div>
      </li>
    ))}
  </ol>
</div>
```

**Where to use immediately:**
- `waste-oil-centrifuge.astro` Process Flow section (lines 774–798)
- `decanter-centrifuge-optimization.astro` whole page restructure — it IS a HowTo
- Installation, Sizing, Sample Testing pages
- Any "How to..." or "N Steps to..." page

---

### 2.5 `<VideoEmbed />` — YouTube with VideoObject schema

Replace raw `<iframe>` embeds with this everywhere.

```astro
---
// src/components/VideoEmbed.astro
export interface Props {
  youtubeId: string;
  title: string;
  description: string;
  uploadDate: string;       // ISO date
  duration?: string;        // ISO 8601, e.g. "PT3M42S"
  thumbnailUrl?: string;
}
const {
  youtubeId,
  title,
  description,
  uploadDate,
  duration,
  thumbnailUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
} = Astro.props;

const videoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": title,
  "description": description,
  "thumbnailUrl": thumbnailUrl,
  "uploadDate": uploadDate,
  ...(duration && { "duration": duration }),
  "contentUrl": `https://www.youtube.com/watch?v=${youtubeId}`,
  "embedUrl": `https://www.youtube.com/embed/${youtubeId}`,
  "publisher": {
    "@type": "Organization",
    "name": "Dolphin Centrifuge",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dolphincentrifuge.com/images/dolphin-logo.png"
    }
  }
};
---

<script type="application/ld+json" set:html={JSON.stringify(videoJsonLd)} />

<figure class="my-6">
  <div class="aspect-video w-full rounded-lg overflow-hidden shadow-md">
    <iframe
      width="100%" height="100%"
      src={`https://www.youtube.com/embed/${youtubeId}`}
      title={title}
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      loading="lazy"
    ></iframe>
  </div>
  <figcaption class="text-sm text-text-muted mt-2 italic text-center">{title}</figcaption>
</figure>
```

**Apply immediately:** waste-oil-centrifuge.astro line 202 — the pilot test video. Replace with `<VideoEmbed youtubeId="y7Rc9SVFbMo" ... />`.

---

### 2.6 `<SpecTable />` — Standardized product spec presentation

Replaces ad-hoc `<table>` blocks. Forces consistency, and emits `Product` schema per row.

```astro
---
// src/components/SpecTable.astro
export interface Props {
  models: Array<{
    name: string;            // "Alfa Laval MOPX-207" — Alfa Laval naming (global recognition)
    href?: string;
    image?: string;
  }>;
  rows: Array<{
    label: string;
    unit?: string;
    values: string[];        // one per model, in order
  }>;
  caption?: string;
}
const { models, rows, caption } = Astro.props;
---

<div class="overflow-x-auto border border-gray-100 rounded-xl my-6">
  <table class="w-full text-sm border-collapse">
    {caption && <caption class="p-3 bg-gray-50 text-sm font-bold text-navy text-left">{caption}</caption>}
    <thead>
      <tr class="bg-navy text-white">
        <th class="p-3 text-left">Specification</th>
        {models.map(m => (
          <th class="p-3 text-left">
            {m.href ? <a href={m.href} class="text-gold hover:underline">{m.name}</a> : m.name}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr class={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
          <td class="p-3 font-semibold text-navy">
            {row.label}{row.unit && <span class="text-text-muted text-xs"> ({row.unit})</span>}
          </td>
          {row.values.map(v => (
            <td class="p-3 font-mono text-xs" set:html={v} />
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Critical rule:** `models[].name` uses Alfa Laval model naming (MOPX-XXX, WHPX-XXX, NX-XXX, BTPX-XXX, BRPX-XXX, P3-XXX, G2-XXX, etc.) for global recognition and AI entity matching. Standardize the format too — pick either `Alfa Laval MOPX-207` or `MOPX-207` and use the same style everywhere; don't mix `MOPX 207` and `MOPX-207` (no space vs hyphen). The component should normalize at render time.

---

### 2.7 `<ComparisonTable />` — Side-by-side competitive comparison

AI engines love "X vs Y" tables. Build one for every major decision the customer makes.

```astro
---
// src/components/ComparisonTable.astro
export interface Props {
  optionA: string;
  optionB: string;
  rows: Array<{ criterion: string; a: string; b: string; winner?: 'a' | 'b' | 'tie' }>;
}
const { optionA, optionB, rows } = Astro.props;
---

<div class="overflow-x-auto border border-gray-100 rounded-xl my-6">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-navy text-white">
        <th class="p-3 text-left">Criterion</th>
        <th class="p-3 text-left">{optionA}</th>
        <th class="p-3 text-left">{optionB}</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(row => (
        <tr>
          <td class="p-3 font-semibold text-navy">{row.criterion}</td>
          <td class={`p-3 ${row.winner === 'a' ? 'bg-green-50 font-bold text-green-800' : ''}`}>{row.a}</td>
          <td class={`p-3 ${row.winner === 'b' ? 'bg-green-50 font-bold text-green-800' : ''}`}>{row.b}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Build these comparisons:**
- Disc Stack vs Decanter
- Centrifuge vs Filter
- Centrifuge vs Settling Tank
- Dolphin Reconditioned vs New OEM
- Self-cleaning vs Manual
- 2-phase vs 3-phase

---

### 2.8 `<FAQ />` — You already have this; just upgrade it

Your existing `FAQ.astro` component is good. Two additions:

1. Make it accept an optional `speakable` prop. If true, emit `SpeakableSpecification` schema (Google's voice-search marker).
2. Always emit individual `Question` IDs so AI engines can deep-link to a specific answer.

---

## 3. Centralized Schema Helpers

Create one file: `src/lib/schema.ts`. All schema generation goes through here. This stops drift across pages.

```typescript
// src/lib/schema.ts

const SITE = 'https://dolphincentrifuge.com';
const ORG_NAME = 'Dolphin Centrifuge';
const LOGO = `${SITE}/images/dolphin-logo.png`;

export const DOLPHIN_ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": ORG_NAME,
  "alternateName": "Dolphin Marine Services",
  "url": SITE,
  "logo": LOGO,
  "description": "Manufacturer of turnkey industrial centrifuge systems built on reconditioned Alfa Laval disc-stack and decanter centrifuge cores. 40+ years of domain expertise serving waste oil, fuel, food, wastewater, and chemical processing industries.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "24248 Gibson Dr.",
    "addressLocality": "Warren",
    "addressRegion": "MI",
    "postalCode": "48089",
    "addressCountry": "US"
  },
  "telephone": "+1-248-522-2573",
  "email": "sales@dolphincentrifuge.com",
  "foundingDate": "1985",
  "areaServed": ["United States", "Canada", "Mexico", "Worldwide"],
  "knowsAbout": [
    "Industrial centrifuges",
    "Disc-stack centrifuges",
    "Decanter centrifuges",
    "Waste oil recovery",
    "Used oil reclamation",
    "Wastewater treatment",
    "Biodiesel production",
    "Fuel polishing"
  ],
  "sameAs": [
    // ADD: LinkedIn URL
    // ADD: Wikidata URL (create entity if none exists)
    // ADD: Industry directory listings
  ]
};

export const SANJAY_PERSON = {
  "@type": "Person",
  "name": "Sanjay Prabhu",
  "honorificSuffix": "MSME",
  "jobTitle": "Founder & Chief Engineer",
  "description": "Master of Science in Mechanical Engineering with 40+ years of specialized experience in industrial centrifuge systems, including disc-stack and decanter centrifuge applications across oil recovery, fuel polishing, wastewater treatment, and biotechnology industries.",
  "image": `${SITE}/images/team/sanjay-prabhu-headshot.webp`,
  "alumniOf": {
    "@type": "EducationalOrganization",
    "name": "" // ADD: Your alma mater
  },
  "worksFor": { "@type": "Organization", "name": ORG_NAME, "url": SITE },
  "url": `${SITE}/about/sanjay-prabhu/`,
  "sameAs": [
    // ADD: LinkedIn profile URL
    // ADD: Any industry profiles (ASME, etc.)
  ]
};

interface ArticleSchemaOpts {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  wordCount?: number;
  articleSection?: string;
}

export function buildArticleSchema(opts: ArticleSchemaOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": opts.headline,
    "description": opts.description,
    "url": opts.url,
    "image": opts.image,
    "datePublished": opts.datePublished,
    "dateModified": opts.dateModified,
    ...(opts.wordCount && { "wordCount": opts.wordCount }),
    ...(opts.articleSection && { "articleSection": opts.articleSection }),
    "author": SANJAY_PERSON,
    "publisher": {
      "@type": "Organization",
      "name": ORG_NAME,
      "url": SITE,
      "logo": { "@type": "ImageObject", "url": LOGO }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": opts.url }
  };
}

interface BreadcrumbOpts {
  items: Array<{ name: string; url: string }>;
}

export function buildBreadcrumbSchema(opts: BreadcrumbOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": opts.items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
```

**Then in every page frontmatter:**

```astro
---
import { buildArticleSchema, buildBreadcrumbSchema, DOLPHIN_ORG, SANJAY_PERSON } from '../lib/schema';

const articleJsonLd = buildArticleSchema({
  headline: "Waste Oil Centrifuge | Industrial Waste Oil Separation Systems",
  description: "Industrial waste oil centrifuges: 3-phase separation up to 12,000 Gs, removes water and solids to 1 micron.",
  url: "https://dolphincentrifuge.com/waste-oil-centrifuge/",
  image: "https://dolphincentrifuge.com/images/waste-oil-centrifuge/waste-motor-oil-centrifuge-system.webp",
  datePublished: "2018-06-15",
  dateModified: "2026-05-12",  // KEEP THIS CURRENT
  articleSection: "Waste Oil Recovery"
});

const breadcrumbJsonLd = buildBreadcrumbSchema({
  items: [
    { name: "Home", url: "https://dolphincentrifuge.com/" },
    { name: "Applications", url: "https://dolphincentrifuge.com/disc-stack-centrifuge-applications/" },
    { name: "Waste Oil Centrifuge", url: "https://dolphincentrifuge.com/waste-oil-centrifuge/" }
  ]
});
---
```

---

## 4. `llms.txt` — The single biggest one-time win

Create `public/llms.txt` at the site root. This is the file AI crawlers fetch to understand your whole site in one shot. Sample below — customize the URLs to match your actual page inventory.

```
# Dolphin Centrifuge

> Reconditioned Alfa Laval industrial disc-stack and decanter centrifuge systems specialist. Based in Warren, Michigan. 40+ years of domain expertise across waste oil, fuel, food, wastewater, and chemical processing applications.

Dolphin Centrifuge designs, builds, and services industrial centrifuge systems built on Alfa Laval cores (MOPX, WHPX, BTPX, BRPX, NX-series, P3, G2, and more). Applications include waste oil recovery, used oil reclamation, fuel polishing, wastewater treatment, biodiesel production, food and beverage clarification, and chemical processing.

## About

- [About Dolphin Centrifuge](https://dolphincentrifuge.com/about-dolphin-centrifuge/): Company history, capabilities, and engineering expertise
- [Sanjay Prabhu, MSME](https://dolphincentrifuge.com/about/sanjay-prabhu/): Founder & Chief Engineer biography and credentials
- [Contact](https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/): Get a quote or technical consultation

## Core knowledge pages

- [Industrial Centrifuge — Types, Cost, Applications](https://dolphincentrifuge.com/industrial-centrifuge/): Pillar overview of all industrial centrifuge categories
- [Disc Stack Centrifuge](https://dolphincentrifuge.com/disc-stack-centrifuge/): How disc-stack separators work
- [Decanter Centrifuge](https://dolphincentrifuge.com/decanter-centrifuge/): How decanter (solid-bowl) centrifuges work
- [Disc Stack vs Decanter](https://dolphincentrifuge.com/difference-between-decanter-centrifuge-disc-centrifuge/): Direct comparison
- [9 Steps to Selecting the Right Industrial Centrifuge](https://dolphincentrifuge.com/picking-the-right-industrial-centrifuge/): Selection guide
- [5 Ways to Optimize Decanter Performance](https://dolphincentrifuge.com/decanter-centrifuge-optimization/): Tuning guide
- [RPM vs RCF Centrifuge Force Calculation](https://dolphincentrifuge.com/centrifuge-rcf-rpm-difference-calculation/): Engineering reference
- [101 FAQs about Disc Stack Centrifuges](https://dolphincentrifuge.com/disc-stack-centrifuge-faqs/): Comprehensive Q&A

## Applications

- [Waste Oil Centrifuge](https://dolphincentrifuge.com/waste-oil-centrifuge/): Used motor oil, hydraulic oil, lube oil recovery
- [Used Oil Centrifuge](https://dolphincentrifuge.com/used-oil-centrifuge/): Lube oil reclamation
- [Black Diesel Centrifuge](https://dolphincentrifuge.com/black-diesel-centrifuge/): Used oil → diesel fuel
- [Wastewater Centrifuge](https://dolphincentrifuge.com/wastewater-centrifuge/): Industrial wastewater dewatering
- [Biodiesel Centrifuge](https://dolphincentrifuge.com/biodiesel-centrifuge/): Glycerin separation
- [Crude Oil Tank Bottom Recovery](https://dolphincentrifuge.com/crude-oil-tank-bottom-recovery-centrifuge/): BS&W removal
- [Pyrolysis Oil Centrifuge](https://dolphincentrifuge.com/pyrolysis-oil-centrifuge/): Pyrolysis oil purification
- [Machine Coolant Centrifuge](https://dolphincentrifuge.com/machine-coolant-centrifuge/): Coolant recycling
- [Cutting Oil Centrifuge](https://dolphincentrifuge.com/cutting-oil-centrifuge/): Cutting fluid reclamation
- [Quench Oil Centrifuge](https://dolphincentrifuge.com/quench-oil-centrifuge/): Heat-treatment oil recovery
- [Beer & Wine Centrifuge](https://dolphincentrifuge.com/beer-wine-centrifuge/): Beverage clarification
- [Biotech Centrifuge](https://dolphincentrifuge.com/alfa-laval-btpx-205-biotech-centrifuge/): Cell harvesting

## Products (Alfa Laval disc-stack series — reconditioned & remanufactured)

- [Alfa Laval WHPX-405](https://dolphincentrifuge.com/alfa-laval-whpx-405/): 3-phase self-cleaning — 5 GPM @ 180°F
- [Alfa Laval MOPX-207](https://dolphincentrifuge.com/alfa-laval-mopx-207/): 3-phase self-cleaning — 32 GPM rated
- [Alfa Laval MOPX-210](https://dolphincentrifuge.com/alfa-laval-mopx-209-centrifuge/): 3-phase self-cleaning — 72 GPM rated
- [Alfa Laval MOPX-213](https://dolphincentrifuge.com/alfa-laval-mopx-209-centrifuge/): 3-phase self-cleaning — 40 GPM @ 180°F
- [Alfa Laval WHPX-513](https://dolphincentrifuge.com/alfa-laval-whpx-513/): 3-phase self-cleaning — 60 GPM @ 180°F
- [Alfa Laval BTPX-205](https://dolphincentrifuge.com/alfa-laval-btpx-205-biotech-centrifuge/): Biotech clarifier
- [Alfa Laval NX-314](https://dolphincentrifuge.com/alfa-laval-nx-314-decanter-centrifuge/): 2-phase decanter, up to 3,000 RPM
- [Alfa Laval NX-418](https://dolphincentrifuge.com/alfa-laval-nx-418-decanter-centrifuge/): 3-phase decanter for oil-water-solids
- [Alfa Laval G2-40](https://dolphincentrifuge.com/alfa-laval-g2-40-decanter/): High-capacity industrial decanter

## Services

- [Industrial Centrifuge Sample Testing](https://dolphincentrifuge.com/industrial-centrifuge-sample-testing/): Ship fluid → pilot test → results report
- [Sample Testing Case Studies](https://dolphincentrifuge.com/sample-testing-case-studies/): Anonymized real-world results
- [Centrifuge Repair & Service](https://dolphincentrifuge.com/centrifuge-repair/): Service for Alfa Laval, GEA, Westfalia disc-stack and decanter centrifuges

## Optional

- [Knowledge Center](https://dolphincentrifuge.com/knowledge-center/): Complete technical library
- [Blog](https://dolphincentrifuge.com/blog/): Latest articles and case studies
```

**Why this matters:** ChatGPT, Claude, and Perplexity all check for `/llms.txt` (and `/llms-full.txt`) at site root. Having one signals you're a GEO-aware site and gives crawlers a curated map of the most important pages.

---

## 5. `robots.txt` Audit

Verify your `public/robots.txt` explicitly allows AI crawlers. The default WordPress / many Astro starters block some. Add:

```
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://dolphincentrifuge.com/sitemap.xml
```

If you're behind Cloudflare, double-check that the "Block AI Bots" setting in the Cloudflare dashboard is OFF (it became default-on in 2025 for many accounts).

---

## 6. The 4-Phase Rollout Plan

### Phase 1 — Foundation (Week 1, 1–2 days of agent work)

**Goal:** System-wide GEO infrastructure. Affects all 150 pages at once.

1. Create `src/lib/schema.ts` with all helpers
2. Create `public/llms.txt`
3. Audit & fix `public/robots.txt`
4. Update `ApplicationLayout.astro`:
   - Inject `Organization` schema globally
   - Inject `BreadcrumbList` schema from page metadata
   - Add `<AuthorByline>` slot above content
   - Add `<LastUpdated>` slot in footer
5. Build the 8 reusable components from §2
6. Create `/about/sanjay-prabhu/` author page with full bio, photo, credentials, LinkedIn link

**Acceptance criteria:** Run `curl https://dolphincentrifuge.com/llms.txt` returns the file. View-source on any page shows `Organization` + `BreadcrumbList` schemas.

---

### Phase 2 — High-traffic pages (Week 2, 3–5 days)

**Goal:** Apply the new template to the 15 highest-traffic pages first.

Priority pages (in order):
1. Homepage
2. `industrial-centrifuge.astro` ← already audited
3. `waste-oil-centrifuge.astro` ← already audited
4. `used-oil-centrifuge.astro`
5. `decanter-centrifuge.astro`
6. `disc-stack-centrifuge.astro`
7. `wastewater-centrifuge.astro`
8. `biodiesel-centrifuge.astro`
9. `crude-oil-tank-bottom-recovery-centrifuge.astro`
10. `pyrolysis-oil-centrifuge.astro`
11. `decanter-centrifuge-optimization.astro` ← already audited
12. `picking-the-right-industrial-centrifuge.astro`
13. `difference-between-decanter-centrifuge-disc-centrifuge.astro`
14. `industrial-centrifuge-sample-testing.astro`
15. `centrifuge-rcf-rpm-difference-calculation.astro`

**Per-page checklist** (give this to the Cloud agent):

- [ ] Add `<AuthorByline reviewedDate="2026-XX-XX" />` after H1
- [ ] Add `<KeyTakeaway>` 134–167 word answer capsule before TOC
- [ ] Replace `Article` schema with `buildArticleSchema()` — set `dateModified` to today
- [ ] Add `BreadcrumbList` schema via `buildBreadcrumbSchema()`
- [ ] If page has video → replace `<iframe>` with `<VideoEmbed>`
- [ ] If page has procedural content → wrap in `<HowToBlock>`
- [ ] If page has specs → migrate to `<SpecTable>` using Alfa Laval model naming
- [ ] If page has X-vs-Y comparison → use `<ComparisonTable>`
- [ ] Verify all model references use **Alfa Laval naming consistently** (MOPX, WHPX, NX-series, BTPX, BRPX — replace any leftover DMPX/DMB references from the prior policy)
- [ ] Normalize style: pick `MOPX-207` (with hyphen) or `MOPX 207` (with space) and use one consistently across the whole site
- [ ] Fix any FAQ typos, factual errors
- [ ] Add `<LastUpdated date="2026-XX-XX" />` after content
- [ ] Run through Google Rich Results Test
- [ ] Run through Schema.org validator

---

### Phase 3 — Long-tail content (Weeks 3–5)

Process remaining ~130 pages in batches of 20. Same checklist as Phase 2. The agent should be able to do most of this autonomously now that the template is locked.

Track in a Google Sheet: page URL, status (pending/done/blocked), last-modified date, schema validator pass/fail.

---

### Phase 4 — New content engine (ongoing)

Set up a quarterly refresh cadence:
- Every 3 months, every cornerstone page (top 30) gets a `dateModified` bump + at least one content addition (new FAQ, new spec, new case study link)
- New pages always use the template from day one
- Track AI citation share monthly using a tool like Profound, AthenaHQ, or even manual sampling of Perplexity / ChatGPT queries

---

## 7. Low-Hanging Fruit (do these THIS WEEK, before any agent work)

These are 30-minute fixes with outsize impact:

1. **Fix the FAQ typo** in `industrial-centrifuge.astro` line 20: `"a75 dB"` → `"75 dB"`
2. **Fix the factual error** in `decanter-centrifuge-optimization.astro` line 175: change "deeper pond" to "shallow pond"
3. **Fix the broken UTF-8 comments** in `industrial-centrifuge.astro`: search-replace `â•â•` → `═══`
4. **Fix the link mismatch** in `waste-oil-centrifuge.astro` line 132: label says MOPX 213, href says mopx-209 — pick one
5. **Add `dateModified` to ALL Article schemas** that have only `datePublished`. Use today's date.
6. **Create the `/llms.txt` file** (see §4)
7. **Verify `robots.txt`** allows AI crawlers (see §5)
8. **Sweep all visible "DMPX-XXX" / "DMB-XXX" references on the three audited pages and replace with the current-production Alfa Laval WHPX equivalents.** Confirmed mapping: DMPX-014 → WHPX-405; DMPX-028 → WHPX-407; DMPX-042 → WHPX-410; DMPX-070 → WHPX-513. All are partial-discharge designs and current production. The older full-discharge MOPX/MAPX equivalents (MOPX-205/207/210/213, MAPX-313) are largely end-of-life and should only appear as `Product.alternateName` schema aliases for legacy entity matching, **not** as primary product recommendations. See Appendix C for the complete cross-reference and decision tree.
9. **Add `priceRange: "$30,000 - $300,000"` (or appropriate range) to the Product schema** so AI engines can answer pricing questions

---

## 8. Author E-E-A-T Placement Specification

This is the single most impactful change for AI citation rate. Here's exactly where author signals appear:

### 8.1 In page schema (JSON-LD)

Every `Article` schema's `author` field uses `SANJAY_PERSON` from `schema.ts`. This means: full name, MSME credential, job title, description with 40+ years experience, photo URL, alumniOf, sameAs to LinkedIn.

### 8.2 At the top of every content page (visible)

The `<AuthorByline />` component renders directly after the H1 (or at the top of the article body, before the TOC). Shows: photo, name, MSME credential, role, experience, last-reviewed date.

### 8.3 At the bottom of every content page (visible)

A short author-bio paragraph + photo. Pattern:

```astro
<aside class="bg-light-bg rounded-xl p-6 border border-gray-100 my-8">
  <div class="flex items-start gap-4">
    <img
      src="/images/team/sanjay-prabhu-headshot.webp"
      alt="Sanjay Prabhu, MSME — Founder & Chief Engineer, Dolphin Centrifuge"
      width="80" height="80"
      class="w-20 h-20 rounded-full object-cover border-2 border-gold shrink-0"
    />
    <div>
      <p class="text-sm font-bold text-navy mb-1">
        About the Author: <a href="/about/sanjay-prabhu/" class="underline">Sanjay Prabhu, MSME</a>
      </p>
      <p class="text-sm text-text-light leading-relaxed">
        Sanjay Prabhu is the Founder and Chief Engineer of Dolphin Centrifuge.
        He holds a Master of Science in Mechanical Engineering and has 40+ years
        of specialized experience in industrial centrifuge systems — including
        disc-stack and decanter centrifuge applications across waste oil recovery,
        fuel polishing, wastewater treatment, food and beverage, and biotechnology.
        Sanjay has personally engineered and commissioned centrifuge systems for
        clients across North America, Europe, the Middle East, and Asia.
      </p>
    </div>
  </div>
</aside>
```

### 8.4 On a dedicated `/about/sanjay-prabhu/` page

This is critical for AI citation. The page should have:
- Full bio (500+ words)
- Photo
- Credentials (MSME, where from, year)
- 40+ years experience, broken down by decade and specialty
- List of major project categories handled
- List of OEM platforms expert in (Alfa Laval, GEA/Westfalia, Flottweg)
- Industry affiliations (ASME, etc.)
- LinkedIn link
- `Person` schema with full `sameAs` array

This page becomes the canonical author URL referenced from every other page.

### 8.5 In the homepage `Organization` schema

`employee` field references `SANJAY_PERSON`. `founder` field too.

### 8.6 In LinkedIn / external profiles

- Make sure your LinkedIn says "Founder & Chief Engineer, Dolphin Centrifuge"
- Add Dolphin Centrifuge to your "Experience" section
- Create a Wikidata entity for "Dolphin Centrifuge" the company AND for yourself if notable enough (Master's degree + 40 years + published technical content = likely meets notability)
- Link from LinkedIn → dolphincentrifuge.com, and from dolphincentrifuge.com → LinkedIn via `sameAs`

---

## 9. Templates for Common Page Patterns

### 9.1 Application page template (e.g., waste-oil-centrifuge.astro pattern)

```
1. Hero image + H1
2. <AuthorByline reviewedDate="..." />
3. <KeyTakeaway>134-167 word answer capsule</KeyTakeaway>
4. <Toc />  (auto-generated from h2 IDs)
5. <h2>What is X?</h2>  (definition section)
6. <h2>How it works</h2>  (operation section with diagram)
7. <h2>Performance Results</h2>  (real numbers in <SpecTable>)
8. <VideoEmbed> if applicable
9. <h2>How to Size for Your Application</h2>  (use <HowToBlock>)
10. <h2>Specifications</h2>  (<SpecTable> with Alfa Laval models)
11. <h2>X vs Alternative</h2>  (<ComparisonTable>)
12. <FAQ items={...} />  (8-12 questions)
13. <h2>Case Studies</h2>  (links to specific case study pages)
14. Author bio block
15. <LastUpdated />
16. Related products / applications
```

### 9.2 Knowledge article template (e.g., decanter-centrifuge-optimization.astro pattern)

```
1. H1
2. <AuthorByline />
3. <KeyTakeaway>
4. <Toc />
5. Either: <HowToBlock> (for procedural)  OR  series of h2 sections (for reference)
6. <SpecTable> or <ComparisonTable> where relevant
7. <FAQ /> (the Q&A list from your "we will address..." intro becomes the FAQPage schema)
8. Author bio block
9. <LastUpdated />
10. Related articles
```

### 9.3 Product page template

```
1. H1 (always uses Alfa Laval naming, e.g., "Alfa Laval MOPX-207 Centrifuge")
2. <AuthorByline />
3. Hero image (3-4 angles minimum)
4. <KeyTakeaway>
5. <SpecTable> (single column, this product)
6. Operating principles section
7. Typical applications (with links to application pages)
8. <VideoEmbed> of product running
9. Pricing range + lead time + warranty
10. <FAQ> (product-specific questions)
11. Quote / contact CTA
12. Related products
13. Author bio
14. <LastUpdated />
```

---

## 10. Success Metrics

Track monthly:

| Metric | How | Target (12 months) |
|--------|-----|---------------------|
| AI citation rate | Manual: ask ChatGPT/Perplexity/Claude 20 standard industry questions, count Dolphin citations | 8+ of 20 |
| Schema validity | Google Rich Results Test on top 30 pages | 100% pass |
| Pages with `dateModified` < 12 months | Sitemap audit script | 95%+ |
| Pages with `KeyTakeaway` block | Grep for component | 100% of content pages |
| Pages with author byline visible | Grep for AuthorByline | 100% of content pages |
| Wikidata entity exists | Check Wikidata | Yes |
| LinkedIn → site links | Manual check | Verified |
| `llms.txt` fetched by crawlers | Server log analysis (look for GPTBot, ClaudeBot, PerplexityBot hits on /llms.txt) | >10/day |

---

## 11. What to do RIGHT NOW (priority order)

1. **TODAY (30 min):** Hand-fix the typo, the factual error, the broken UTF-8 comments, and the link mismatch in the three audited files. These are embarrassing and visible.

2. **TOMORROW (2 hours):** Create `/llms.txt` and audit `/robots.txt`. These are zero-risk, immediate-benefit changes.

3. **THIS WEEK (1 day):** Create the `/about/sanjay-prabhu/` page. Get a professional headshot if you don't have one. Write the bio yourself — don't outsource this; AI engines reward first-person, authentic-voice author pages.

4. **THIS WEEK (1 day):** Hand this entire document to your Astro Cloud agent. Have it build the 8 components from §2 and the schema helpers from §3.

5. **NEXT WEEK:** Roll the new template across the top 15 pages (§6 Phase 2).

6. **MONTH 2–3:** Roll across remaining ~130 pages.

7. **ONGOING:** Quarterly refresh cycle. Set a Google Calendar reminder for the first Monday of every quarter to update `dateModified` on the top 30 pages and add at least one new piece of structured content (a new FAQ, a new spec row, a new comparison).

---

## Appendix A: The Brand Nomenclature Rule (POLICY REVERSED — May 2026)

**Important policy change:** The earlier rule requiring DMPX-XXX / DMB-XXX naming on customer-facing pages has been **reversed**. Alfa Laval model numbers (MOPX, WHPX, NX-series, BTPX, BRPX, P3, G2, etc.) are now used everywhere for global recognition and AI entity matching.

The component library enforces consistency at the template level:

- **Customer-facing body copy:** Alfa Laval model names (e.g., `Alfa Laval MOPX-207`, `Alfa Laval WHPX-513`, `Alfa Laval NX-418`)
- **Customer-facing tables (`<SpecTable>`):** Alfa Laval model names. The component should validate the input and normalize formatting (consistent hyphen vs space).
- **Customer-facing FAQ:** Alfa Laval model names
- **OEM platform manufacturer tables** (the "Manufacturers" section on `industrial-centrifuge.astro`): Alfa Laval, GEA, Westfalia, Flottweg, Hiller, Heinkel are all fine — this is a *list of OEMs*, no change needed
- **URLs / file slugs:** Existing legacy slugs like `/alfa-laval-whpx-405/` stay (the 133-URL preservation rule); they now also match the body copy, which makes the URL → entity association cleaner than before
- **Dolphin value proposition:** Continues to emphasize *reconditioned*, *remanufactured*, *40+ years of expertise*, *turnkey systems*, *engineering customization*, *price advantage vs. new OEM* — the differentiation moves to **service and expertise**, not naming

**Why the reversal makes sense for GEO:** AI engines build entity associations from text. When millions of pages across the web reference "Alfa Laval MOPX-207" — engineering forums, industry publications, OEM documentation, competitor sites — those become the canonical entity. By using the same canonical name, Dolphin Centrifuge gets associated *with* that entity instead of fighting *against* it. The citation slot in an AI answer to "who sells reconditioned Alfa Laval MOPX-207?" goes to the page that uses that exact entity name with strong supporting signals (author, schema, performance data, pricing).

**Cleanup task:** Any page, document, or skill file that still enforces the old DMPX/DMB rule needs to be updated:
- `CENTRIFUGE_BRAIN.md` (in Jake's skill folder)
- `CENTRIFUGE_SKILLS.md` (in Jake's skill folder)
- Any website-rebuild instruction docs (CCA agent guidance)
- The `JAKE_IDENTITY.md` or proposal-generation templates if they referenced the rule

---

## Appendix B: Common Mistakes the Cloud Agent Should Avoid

1. **Do not merge or redirect any of the 133 legacy URLs** without explicit written approval. URL preservation is non-negotiable.
2. **Do not edit legacy body text** that has been marked sacred — append new content, don't replace.
3. **Do not use Netlify MCP or wrangler** for deployments. Use the established GitHub → Netlify pipeline.
4. **Do not introduce `localStorage` / `sessionStorage`** in any component.
5. **Always preserve image alt text and figcaptions** — these are already optimized.
6. **Use `<time datetime="ISO">`** for all dates, never raw text.
7. **Test schema with the official validator** before committing: https://validator.schema.org/

---

*End of roadmap. Hand the whole file to the Astro Cloud agent and start with §7 today.*

---

## Appendix C: DMPX → Alfa Laval Cross-Reference Table (CONFIRMED)

This is the authoritative mapping for migration. Two technical dimensions matter beyond capacity:

1. **Discharge mechanism** — *partial* discharge ejects only the sludge layer (low product loss, current Alfa Laval design); *full* discharge ejects the entire bowl contents (older design, needed only for very high sludge loads).
2. **Current availability** — WHPX (partial-discharge) series remains in active production and is the **primary recommendation** for new customers. MOPX and MAPX (full-discharge) series are largely end-of-life and hard to source; they should only be referenced when the customer specifically needs full-discharge operation (very high sludge applications) or when describing legacy installed-base scenarios.

| Legacy Dolphin | Current / Recommended (Partial Discharge) | Legacy / EOL (Full Discharge) | Capacity |
|---|---|---|---|
| DMPX-014 | **Alfa Laval WHPX-405** ✅ available | MOPX-205 (legacy, rare) | 5–10 GPM |
| DMPX-028 | **Alfa Laval WHPX-407** ✅ available | MOPX-207 (legacy, rare) | ~30 GPM |
| DMPX-042 | **Alfa Laval WHPX-410** ✅ available | MOPX-210 (legacy, rare) | ~45 GPM |
| DMPX-070 | **Alfa Laval WHPX-513** ✅ available | MOPX-213, MAPX-313 (legacy, rare) | 50–60 GPM @ 180°F |

> **Note on the partial/full pattern at smaller tiers:** Sanjay has explicitly confirmed the partial-vs-full distinction at the DMPX-070 tier. The same partial-discharge-current / full-discharge-legacy pattern is *assumed* for the DMPX-014, DMPX-028, and DMPX-042 tiers based on the consistent WHPX-vs-MOPX naming convention, but should be **verified with Sanjay before publishing** customer-facing content at those tiers.

### Recommendation rule for new customer-facing content

**Default to WHPX (partial discharge).** Use this on:
- Website product pages and application pages
- Quotes and proposals
- Email outreach drafted by Jake
- Case studies referencing current installations
- Sample testing reports

**Only mention MOPX or MAPX (full discharge) when:**
- The customer specifically asks about a full-discharge unit
- The application has very high sludge loads where full-discharge is technically required
- You're describing a legacy installation Dolphin services
- You're showing historical performance data taken on a MOPX or MAPX unit (in which case, also offer the modern WHPX equivalent as the recommended path forward)

### Application-to-variant decision tree (updated)

```
Step 1 — Determine capacity tier from the customer's GPM requirement:
    5–10 GPM       → tier DMPX-014  → WHPX-405
    ~30 GPM        → tier DMPX-028  → WHPX-407
    ~45 GPM        → tier DMPX-042  → WHPX-410
    50–60 GPM      → tier DMPX-070  → WHPX-513

Step 2 — Discharge type:
    Default: WHPX (partial discharge). Use this 95% of the time.
    Exception (full discharge needed): customer has >5% solids in feed,
        OR application is high-ash used motor oil with frequent ejection
        OR customer requests full discharge specifically
        → reference MOPX or MAPX equivalent, but flag availability concern
          and recommend WHPX as the modern path

Step 3 — Special-purpose series (no DMPX cross-reference):
    Beverage clarification (beer, wine)         → BRPX series
    Biotech / cell harvesting                   → BTPX series
    Decanter applications (high-solids slurry)  → NX-series (NX-314, NX-418)
                                                  or G2-series, P3-series
```

### Style normalization

- Always use **hyphen, not space**: `WHPX-513`, never `WHPX 513`
- First reference on a page includes the brand prefix: `Alfa Laval WHPX-513`
- Subsequent references in the same section can drop the brand: `WHPX-513`
- In `<SpecTable>` headers and `ProductCard` titles, always include the full `Alfa Laval WHPX-513` form for AI entity matching
- Never write `WHPX513` (no hyphen, no space) — Alfa Laval's own documentation uses the hyphen form

### URL slug preservation

Existing URL slugs stay regardless of naming changes:
- `/alfa-laval-whpx-405/` ✅ (already correct — WHPX is the current series)
- `/alfa-laval-whpx-513/` ✅ (already correct)
- `/alfa-laval-mopx-209-centrifuge/` ⚠️ (slug says MOPX-209, body content currently references MOPX-213, which is a legacy model — verify which model this URL truly serves; if the page is genuinely about a legacy MOPX-213, keep it as a legacy-product reference page and add a "modern equivalent: WHPX-513" callout)

If a current page uses a DMPX slug like `/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/` — **keep the slug** (URL preservation rule) but update the page H1, title, body content, and schema to `Alfa Laval WHPX-405`. Add `Product.alternateName` for the legacy DMPX-014 entity alias.

### Schema update for migrated pages

When migrating a DMPX page to its current Alfa Laval equivalent, update the Product schema like this:

```javascript
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Alfa Laval WHPX-513 Disc-Stack Centrifuge",
  "alternateName": [
    "WHPX-513",
    "WHPX 513",
    "DMPX-070",                     // legacy Dolphin alias
    "MOPX-213",                     // legacy full-discharge equivalent
    "MAPX-313"                      // legacy full-discharge equivalent
  ],
  "model": "WHPX-513",
  "brand": { "@type": "Brand", "name": "Alfa Laval" },
  "manufacturer": { "@type": "Organization", "name": "Alfa Laval" },
  "seller": { "@type": "Organization", "name": "Dolphin Centrifuge", "url": "https://dolphincentrifuge.com" },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Discharge Type", "value": "Partial Discharge" },
    { "@type": "PropertyValue", "name": "Series Status", "value": "Current production" }
  ],
  // ... rest of schema
}
```

This preserves every legacy entity association in your schema (Dolphin DMPX, plus the old full-discharge MOPX/MAPX siblings) while migrating the visible content to the canonical current WHPX name. When someone searches AI engines for any of those legacy names, your page becomes the canonical landing point that also tells them "the modern equivalent is WHPX-513."
