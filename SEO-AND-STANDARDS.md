# Dolphin Centrifuge — SEO, Standards & Best Practices Reference

## This file is the single source of truth for all quality standards across every page.
## Reference this before building or reviewing ANY page.

---

## 1. SEO FUNDAMENTALS (Every Page)

### Meta Tags
- `<title>` — Under 60 chars, primary keyword first, brand last. Example: "Waste Oil Centrifuge | Industrial Oil Recovery | Dolphin Centrifuge"
- `<meta name="description">` — 150-160 chars, include primary keyword + value prop + CTA hint
- `<meta name="robots" content="index, follow">`
- Canonical URL on every page: `<link rel="canonical" href="https://dolphincentrifuge.com/[slug]/" />`
- Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- Twitter card meta tags

### Heading Hierarchy
- One `<h1>` per page — contains primary keyword
- `<h2>` for major sections — contain secondary keywords
- `<h3>` for subsections — long-tail keywords where natural
- Never skip heading levels (no h1 → h3)

### URL Rules
- ALL legacy URLs preserved exactly (flat, no path prefixes)
- New pages: lowercase, hyphenated, descriptive slugs
- Trailing slashes on all URLs

---

## 2. IMAGE STANDARDS

### File Naming
- Descriptive, keyword-rich, hyphenated lowercase
- BAD: `IMG_2847.jpg`, `photo1.jpg`
- GOOD: `waste-oil-centrifuge-3-phase-disc-stack-system.jpg`
- Include application/product context in filename

### Alt Text
- Every `<img>` MUST have descriptive alt text
- Include primary keyword naturally
- Describe what's IN the image, not just the page topic
- BAD: `alt="centrifuge"`
- GOOD: `alt="Dolphin Centrifuge DMPX-042 three-phase disc stack centrifuge module for crude oil tank bottom recovery"`
- For decorative images only: `alt=""`

### Format & Size
- Hero images: WebP preferred, JPEG fallback, max 200KB
- Product photos: WebP or PNG (if transparency needed), max 150KB
- Inline content images: max 100KB
- Icons/diagrams: SVG preferred
- All images should have explicit `width` and `height` attributes (CLS prevention)
- Use `loading="lazy"` on all images below the fold
- Hero/above-fold images: `loading="eager"` + `fetchpriority="high"`

### Graphs & Technical Diagrams (Redrawn Assets)
Legacy graphs, sketches, and line drawings are professionally redrawn using the `dolphin-graphs` skill. Two output types:

**SVG Graphs** (performance curves, comparison charts, relationship diagrams):
- Output: Inline SVG — all text is searchable by Google and AI crawlers
- Saved to: `/public/images/graphs/`
- Fonts: Plus Jakarta Sans (titles), Source Sans 3 (axis labels, legends)
- Line color sequence: 1st Navy `#1B3A5C`, 2nd Gold `#E8A317`, 3rd Gray `#6B7280` (dashed), 4th Teal `#0D9488`, 5th Rust `#B45309`
- Line thickness: 2px (thin, clean). Markers: 5px diameter
- Background: Warm White `#F5F5F0`
- Copyright: `© dolphincentrifuge.com` — small font, visible, inside graph area
- Watermark: Faint Dolphin logo behind graph (10-15% opacity)
- Legend: bottom-left or bottom-center, outside plot area
- Title: top-left, Plus Jakarta Sans semibold

**WebP Technical Diagrams** (cross-sections, cutaway drawings, equipment sketches):
- Output: SVG → WebP conversion via `sharp` CLI
- Saved to: `/public/images/diagrams/`
- Max file size: 100KB
- Legacy filenames preserved (extension swapped, e.g., `Bowl-Cross-Section.jpg` → `Bowl-Cross-Section.webp`)

**Rules for ALL redrawn assets:**
- Legacy alt text preserved exactly — NEVER modify
- Legacy filenames kept for SEO continuity
- Content fidelity is paramount — no word/data changes without Sanjay's approval
- Always generate 2-3 variants before final implementation
- Original legacy image is NEVER deleted

### Aspect Ratios (Consistency)
- Hero images: 16:9 or 3:2 landscape
- Product card thumbnails: 4:3
- Inline content: flexible but consistent within a page

---

## 3. AI CITATION OPTIMIZATION

### AI-Friendly Content Structure
Each application/product page should include an **authoritative summary paragraph** near the top that:
- States what the product/application IS in plain language
- Includes key specs (capacity, separation level, materials)
- Mentions the company name and expertise qualifier
- Is factual, specific, and quotable by AI agents

Example pattern:
> "Dolphin Centrifuge supplies purpose-modified industrial disc stack centrifuges for [application]. Operating at [X] Gs with separation down to [Y] microns, these systems process [Z] GPM continuously. Based in Warren, Michigan, Dolphin Centrifuge has over 40 years of experience in centrifugal separation across [industry]."

### Structured Data (Schema.org)
Every page type needs appropriate JSON-LD:
- **Application pages**: `Product` + `FAQPage` schemas
- **Product pages**: `Product` schema with offers, specs, images
- **Service pages**: `Service` schema
- **Blog/Knowledge**: `Article` + `HowTo` or `FAQPage` as appropriate
- **Homepage**: `Organization` + `LocalBusiness`
- **Contact**: `LocalBusiness` with full NAP (Name, Address, Phone)
- **Testimonials**: `Review` schema

### FAQ Sections
- Add 3-5 FAQ items to every application and product page
- Use `<details>/<summary>` or dedicated FAQ component
- Mark up with `FAQPage` schema
- Questions should match real search queries (use "People Also Ask" patterns)

---

## 4. INTERNAL LINKING STRATEGY

### Cross-Connection Rules
Every page should link to:
- **2-3 related applications** (e.g., waste oil → used oil, black diesel, WVO)
- **1-2 relevant products** (e.g., waste oil → DMPX-042, DMPX-070)
- **1 relevant service** (e.g., → sample testing, rental)
- **1 knowledge article** (e.g., → selection guide, troubleshooting)
- **Contact page** (always, via CTA)

### Anchor Text Best Practices
- Use descriptive keyword-rich anchor text
- BAD: "click here", "learn more"
- GOOD: "our waste oil centrifuge systems", "disc stack centrifuge FAQ"
- Vary anchor text — don't use identical text for every link to the same page

### Sidebar Links (ApplicationLayout)
- Related Applications: 3-4 links
- Recommended Products: 2-3 links with Dolphin model numbers
- Quick Contact: phone + email + quote link
- Trust badge: 40+ years, Warren MI

### Breadcrumbs
- Every page should have breadcrumb navigation
- Schema markup: `BreadcrumbList`
- Pattern: Home > Applications > Oil & Fuel > Waste Oil Centrifuge

---

## 5. CTA PLACEMENT

### Every Page Must Have:
1. **Hero CTA** — "Get a Free Quote" button + phone number (above fold)
2. **Mid-page CTA** — Blockquote or callout box after 2-3 content sections
3. **Bottom CTA bar** — Navy banner with quote + sample testing buttons
4. **Sidebar CTA** — Quick Contact card (on ApplicationLayout pages)
5. **Sticky mobile CTA** — Consider floating phone/quote button on mobile

### CTA Hierarchy
- Primary: "Get a Free Quote" → `/contact-for-alfa-laval-centrifuges/`
- Secondary: "Free Sample Testing" → `/industrial-centrifuge-sample-testing/`
- Tertiary: Phone `(248) 522-2573` / Email `sales@dolphincentrifuge.com`

---

## 6. DEMO BOX / BEFORE-AFTER SECTION

### For Application Pages Where Sample Testing Data Exists:
Add a "Pilot Testing Results" or "See the Difference" section showing:
- Before photo (dirty/contaminated fluid)
- After photo (clean/separated product)
- Key metrics (% removal, clarity improvement, PPM reduction)
- Link to sample testing service

### Implementation:
```astro
<!-- DemoBox component pattern -->
<div class="demo-box bg-light-bg rounded-xl p-6 border">
  <h3>Pilot Testing Results</h3>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <img src="before.jpg" alt="Contaminated waste oil sample before centrifuge processing" />
      <span>Before</span>
    </div>
    <div>
      <img src="after.jpg" alt="Clean recovered oil after disc stack centrifuge separation" />
      <span>After</span>
    </div>
  </div>
  <table><!-- Key metrics --></table>
  <a href="/industrial-centrifuge-sample-testing/">Send Us Your Sample →</a>
</div>
```

### Pages That Should Have Demo Boxes:
- Waste oil, used oil, crude oil (oil clarity before/after)
- Wastewater (turbidity reduction)
- Machining coolant (tramp oil removal)
- Beer/wine (clarity improvement)
- Algae (concentration results — we have photos!)
- Any page where pilot test photos exist in the legacy image folders

---

## 7. ROI CALCULATOR

### New Page: `/centrifuge-roi-calculator/`
Interactive calculator that estimates:
- Annual fluid replacement cost savings
- Waste disposal cost reduction
- Product recovery value (oil, coolant, etc.)
- Payback period for centrifuge investment
- Comparison: centrifuge vs. current method (filters, settling, disposal)

### Inputs:
- Current fluid volume (gallons/month)
- Fluid replacement cost ($/gallon)
- Current disposal cost ($/gallon)
- Current fluid life (weeks/months)
- Industry/application type (dropdown)

### Outputs:
- Estimated annual savings
- Payback period
- Environmental impact (gallons saved from disposal)

### Link ROI Calculator From:
- Every application page sidebar or mid-content CTA
- Homepage "Why Centrifuge?" section
- Services pages

---

## 8. PERFORMANCE / SPEED (GTmetrix Targets)

### Target Scores:
- GTmetrix Grade: A (90+)
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1

### Implementation:
- Astro static HTML (no JS framework overhead) ✅
- Preload hero images with `<link rel="preload">`
- Inline critical CSS (Astro handles this)
- Defer non-critical JS
- Use `loading="lazy"` on all below-fold images
- Serve images in WebP with JPEG fallback
- Enable Netlify asset optimization (CSS/JS minification, image compression)
- Set proper cache headers via `_headers` file
- Preconnect to Google Fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">`

### Netlify Headers File (`public/_headers`):
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/images/*
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable
```

---

## 9. BLOG / CONTENT MANAGEMENT

### Easy Content Addition Strategy
Use Astro Content Collections for blog/case studies:

```
site/src/content/
├── blog/           → Technical articles, guides
├── case-studies/   → Customer success stories
└── config.ts       → Schema definitions
```

### Blog Post Template Should Include:
- Title, date, author, category, tags
- Featured image with alt text
- Estimated reading time
- Related articles (auto-generated from tags)
- CTA at bottom
- Schema markup (Article)
- Social sharing meta tags

### Content Calendar Priorities:
1. Case studies with real customer results (highest conversion)
2. "How to choose" guides (captures top-of-funnel traffic)
3. Troubleshooting articles (captures existing equipment owners)
4. Industry news/trends (thought leadership)
5. Comparison articles (centrifuge vs. filter, disc vs. decanter)

---

## 10. TECHNICAL SEO CHECKLIST

### Sitemap
- Auto-generated XML sitemap at `/sitemap.xml`
- Submit to Google Search Console
- Include all pages, exclude redirected URLs

### Robots.txt
```
User-agent: *
Allow: /
Sitemap: https://dolphincentrifuge.com/sitemap.xml

# Block admin/draft pages if any
Disallow: /drafts/
```

### Redirects (`public/_redirects`)
```
/cannabis-thc-extraction-centrifuge/  /disc-stack-centrifuge-applications/  301
/hemp-extraction-centrifuge/          /disc-stack-centrifuge-applications/  301
/hemp-biomass-centrifuge/             /disc-stack-centrifuge-applications/  301
/diesel-fuel-purifier/                /alfa-laval-diesel-centrifuge/        301
```

### Page Speed Essentials
- [ ] All images have width/height attributes
- [ ] Hero images preloaded
- [ ] No render-blocking resources
- [ ] Fonts preloaded with display=swap
- [ ] No unused CSS/JS
- [ ] Gzip/Brotli compression (Netlify default)

### Accessibility
- All images have alt text
- Color contrast meets WCAG AA (navy on white = good, gold on white = check)
- Form labels on all inputs
- Keyboard navigation works
- Skip-to-content link

---

## 11. BRANDING RULES (Quick Reference)

- Company: **Dolphin Centrifuge**
- Phone: **(248) 522-2573**
- Email: **sales@dolphincentrifuge.com**
- Address: **24248 Gibson Dr., Warren MI 48089**
- NEVER expose Alfa Laval model numbers on Dolphin product pages
- Dolphin models: DMPX-010, DMPX-014, DMPX-028, DMPX-042, DMPX-070, DMB-004 through DMB-062
- Decanters keep AL names: NX-314, NX-418, G2-40, CHNX-418
- Legacy AL model pages exist for SEO but are NOT in navigation

---

## 12. PAGE COMPLETION CHECKLIST

Before marking ANY page as "done," verify:

- [ ] Title tag < 60 chars with primary keyword
- [ ] Meta description 150-160 chars
- [ ] Canonical URL set
- [ ] H1 contains primary keyword
- [ ] AI-friendly summary paragraph near top
- [ ] All images have descriptive alt text
- [ ] All images have width/height attributes
- [ ] Hero image optimized (< 200KB, WebP)
- [ ] 3+ internal links to related pages
- [ ] CTA above fold (quote + phone)
- [ ] Mid-page CTA callout
- [ ] Bottom CTA bar
- [ ] FAQ section (3-5 questions) with schema
- [ ] Schema.org JSON-LD markup
- [ ] Breadcrumb navigation
- [ ] No broken links
- [ ] No Alfa Laval model numbers on Dolphin product pages
- [ ] Demo box (if pilot test photos available)
- [ ] ROI calculator link (where relevant)
- [ ] Mobile responsive check
