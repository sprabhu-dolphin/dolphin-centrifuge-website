# Codex Handoff - Contact Page "Above the Fold" + CTA Cleanup

Role: AUDITOR + EXECUTIONER. Claude already wrote the code. Your job is to audit
those changes against the intent below, finish the verification Claude could not
do in its sandbox (full production build + live preview), fix anything that is
wrong, and commit.

## SCOPE GUARDRAIL - read first
This is a PAGE-SPECIFIC change to the Contact page only:
`/contact-for-alfa-laval-centrifuges/`

It is NOT a site-wide redesign. One shared file was touched
(`src/layouts/ApplicationLayout.astro`) but ONLY by adding optional props whose
defaults reproduce the previous hardcoded behavior. Every other page that uses
ApplicationLayout (products, applications, services, knowledge, about - ~158
pages) MUST render byte-for-byte identical to before. If your audit finds ANY
visual or markup change on a non-Contact page, that is a regression - fix it.

## The two problems being solved
1. Redundant self-referencing CTAs: on the Contact page, the hero "Get a Quote"
   button and the sidebar "Request a Quote" button both linked back to the
   Contact page itself.
2. Form sat below the fold: a tall hero + an H2 "Find Us in Warren" blurb (2
   paragraphs) + a large redundant navy "Contact Dolphin Centrifuge" banner all
   stacked above the form, pushing it down.

## Exactly what Claude changed

### File A (SHARED, additive only): src/layouts/ApplicationLayout.astro
- Added optional props to the `Props` interface: `heroCompact`, `heroCtaLabel`,
  `heroCtaHref`, `heroSecondaryCtaLabel`, `heroSecondaryCtaHref`,
  `hideSidebarQuoteCta`.
- Added destructuring defaults that MUST equal the old hardcoded values:
  - heroCompact = false
  - heroCtaLabel = 'Get a Quote'
  - heroCtaHref = '/contact-for-alfa-laval-centrifuges/'
  - heroSecondaryCtaLabel = '(248) 522-2573'
  - heroSecondaryCtaHref = 'tel:+12485222573'
  - hideSidebarQuoteCta = false
- The `<Hero ... />` call now passes those props (added `compact={heroCompact}`)
  instead of literal strings.
- The sidebar "Request a Quote" `<a>` is now wrapped in
  `{!hideSidebarQuoteCta && ( ... )}`.

### File B (page-specific): src/pages/contact-for-alfa-laval-centrifuges.astro
- The `<ApplicationLayout>` call now also passes:
  `heroCompact={true}`, `heroCtaLabel="Get Your Quote"`,
  `heroCtaHref="#contact-form"`, `hideSidebarQuoteCta={true}`
  (existing `hideBottomCTA={true}` kept).
- DELETED the in-page navy "CONTACT HERO BANNER" `<div>` that sat above the form.
- REPLACED the old H1 + "Find Us" H2 + 2 paragraphs (which were above the form)
  with: the H1, then a single one-line intro `<p>` (includes the phone link).
- MOVED the "Find Us in Warren, Michigan" H2 + its 2 paragraphs to BELOW the
  form, immediately after the map `<iframe>`, still inside `section#contact-form`.

## KNOWN RISK - verify file integrity first
During Claude's session, the editor write path TWICE silently truncated
`src/layouts/ApplicationLayout.astro` mid-CSS (chopped it around line 564, ending
on a partial word `box-sha`). Claude restored from git and re-applied the edits
via a script. Before trusting anything, confirm both files are whole:

```bash
wc -l src/layouts/ApplicationLayout.astro          # expect 601
tail -3 src/layouts/ApplicationLayout.astro         # MUST end with </style>
grep -c "not-prose :where(a)" src/layouts/ApplicationLayout.astro   # expect 1
wc -l src/pages/contact-for-alfa-laval-centrifuges.astro            # expect 786
tail -1 src/pages/contact-for-alfa-laval-centrifuges.astro          # MUST be </ApplicationLayout>
```
If any of these fail, the file is corrupted - re-apply from the intent above.

## Audit checklist (static)
Run these greps and confirm each:

```bash
# Contact page
grep -c 'Get a Quote - Warren, Michigan' src/pages/contact-for-alfa-laval-centrifuges.astro   # 0 (banner removed)
grep -c 'heroCtaHref="#contact-form"'    src/pages/contact-for-alfa-laval-centrifuges.astro   # 1
grep -c 'hideSidebarQuoteCta={true}'     src/pages/contact-for-alfa-laval-centrifuges.astro   # 1
grep -c 'Find Us in Warren, Michigan'    src/pages/contact-for-alfa-laval-centrifuges.astro   # 1 (relocated, not duplicated)
grep -c 'id="centrifuge-contact-form"'   src/pages/contact-for-alfa-laval-centrifuges.astro   # 1
grep -c 'id="contact-form"'              src/pages/contact-for-alfa-laval-centrifuges.astro   # 1 (anchor target for hero CTA)

# Shared layout - defaults must match old behavior
grep -n "heroCtaHref = '/contact-for-alfa-laval-centrifuges/'" src/layouts/ApplicationLayout.astro  # present
grep -n "heroCtaLabel = 'Get a Quote'"  src/layouts/ApplicationLayout.astro                          # present
grep -n "hideSidebarQuoteCta &&"        src/layouts/ApplicationLayout.astro                          # present
```

Also confirm:
- H1 still comes before the first H2 in the article body (SEO). After the change
  the first H2 is "Reach Us Directly", which is fine - just confirm no H2
  precedes the single H1.
- The 3 JSON-LD blocks (ContactPage, LocalBusiness, FAQPage) are untouched.
- The form's submit `<script>` (getFluidRedirect / showSuccessToast) is intact.

## Build + preview (the part Claude could not finish)
Claude's Linux sandbox could not run the full 159-page build (time limit) and its
localhost is not reachable from the user's browser. You do it on the real machine:

```bash
npm ci            # ensures platform-native rollup binary is present
npm run build     # MUST complete with zero errors across all pages
npm run dev        # then open http://localhost:4321/contact-for-alfa-laval-centrifuges/
```

Visual checks on the live Contact page (desktop ~1920x1080 and mobile width):
- The form's first fields are visible without scrolling (above the fold) on desktop.
- Hero is the shorter/compact height.
- Hero "Get Your Quote" button scrolls down to the form (does not navigate/reload).
- No "Request a Quote" button in the right sidebar; phone + email links remain.
- "Find Us in Warren" text now appears BELOW the form, next to the map.
- The old big navy "Contact Dolphin Centrifuge" banner is gone.

## Site-wide regression spot-check (REQUIRED)
Open 2-3 NON-contact pages that use ApplicationLayout, e.g.:
- /disc-stack-centrifuge/
- /decanter-centrifuge/
- /diesel-centrifuge/
Confirm on each:
- Hero still shows the full-height hero with "Get a Quote" linking to
  /contact-for-alfa-laval-centrifuges/.
- Sidebar still shows the gold "Request a Quote" button.
If those are unchanged, the additive-prop approach held and scope is respected.

## Acceptance criteria
- [ ] Both files pass the integrity checks (no truncation).
- [ ] `npm run build` completes, zero errors.
- [ ] Contact page: form above the fold, no self-referencing quote CTAs, Find Us
      moved below, hero CTA scrolls to #contact-form.
- [ ] At least 2 non-contact pages verified visually unchanged.
- [ ] Commit scoped to these 2 files only (do not sweep unrelated working-tree
      changes that were already present before this task).

## Commit
Stage ONLY:
- src/pages/contact-for-alfa-laval-centrifuges.astro
- src/layouts/ApplicationLayout.astro
(and optionally delete this handoff file)

Suggested message:
`contact page: lift form above the fold, drop self-referencing quote CTAs (layout props additive, no site-wide change)`
