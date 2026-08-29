# One spec source per machine

**Short version: every published machine number lives in exactly one file, and the build
fails if a page disagrees with it.**

Before this, a machine number lived in whatever page printed it. The same centrifuge could
carry three different capacities on three different pages and nobody noticed until an
auditor read all three. The 2026-08-24 ruling worksheet settled about sixty of those
conflicts by hand. This system is what keeps them settled.

---

## How to change a number

1. Open `src/data/centrifugeSpecs.ts`.
2. Find the model. Change the value.
3. Run `npm run build`.

That is the whole procedure. Every spec table that renders from the data updates itself.
If a page still shows the old number somewhere the build did not reach, the build fails and
names the page.

**Do not edit a spec number inside a page.** If you find yourself typing a GPM, RPM, HP or
G-force figure into an `.astro` file, that number belongs in the data file instead.

---

## The three pieces

### 1. `src/data/centrifugeSpecs.ts` - the source

One record per machine the site publishes specs for. Each record carries the designation,
family, Dolphin module, capacities, bowl speed, motor, dimensions, and the rulings behind
them.

Two rules make it trustworthy:

- **Every capacity states its fluid.** A flow rate without its duty is not a fact. That was
  the single biggest lesson of the audit, so `fluid` is a required field.
- **Nothing is invented.** A value with no source is left out. A value that is parked
  pending an owner ruling is marked `tbd: true` with a note saying what is missing.

Where a machine's OEM capacities already live in
`src/data/centrifugeTechnicalRegistry.mjs` (the L/h capacity tables, reviewed 2026-08-28),
this file **imports** them rather than retyping them. The two files cannot drift apart,
because there is only one copy of the number.

Each record can also carry `rejectedValues`: numbers that were published in error and
corrected by a ruling, with the ruling id and reason attached. That list is what the guard
enforces, so it maintains itself as new rulings land.

### 2. `scripts/spec-consistency-check.mjs` - the guard

Runs automatically as part of `npm run build` (`astro build && node
scripts/spec-consistency-check.mjs`). **A violation fails the build.** Runs in under a
second, plain node, no dependencies. Run it alone with `npm run spec:check` after a build.

It reads the built site and checks three things:

- **Forbidden values.** For every model, if a known-wrong historical number turns up near a
  mention of that model on any page, the build fails with the page, the model, the value,
  the ruling that killed it, and the sentence it found. Retired designations (DMSC-042,
  SSB-206, CBPX-213-XP) are forbidden anywhere on the site.
- **Model-page assertion.** Each model's own page must still carry its canonical capacity,
  bowl speed and motor power. This catches the opposite failure: a correct value quietly
  deleted or edited away.
- **Label coherence.** Where a capacity carries a `label` (the exact published cell text),
  that label must still contain its own numeric value. You cannot change one and forget the
  other.

Two escape hatches, both deliberate and both requiring a written reason:

- `unless` on a rejected value exempts a hit when the ruling itself permits that reading -
  for example A6 allows any NX 314 flow figure printed with its real duty, and E7 allows a
  large weight explicitly labelled as the *skid* weight rather than the bare machine.
- `skipPageAssert` tells the guard not to expect a field on a page that legitimately does
  not print it.

The guard also scopes by nearest mention and by machine family, so a page listing several
machines side by side does not trip every model's rules at once.

### 3. `/specs.json` - the public endpoint

`src/pages/specs.json.ts` serialises the whole data set to `https://dolphincentrifuge.com/specs.json`
at build time. This is **deliberately public**. It is there for AI crawlers and answer
engines, and it is the data source Dolphin's future MCP server will serve.

It carries the non-affiliation disclaimer, the publisher block, and a `usage.rules` list
that tells a machine reader how the numbers may and may not be used - never quote a flow
rate without its fluid, never transfer a capacity between fluids or base machines, never
treat a rated reference as an application capacity, never infer an absent field from a
sibling model.

Because the pages and the endpoint render from the same file, the JSON and the site can
never say different things.

### MCP note

`/specs.json` is the intended backing store for a Dolphin MCP server. A tool such as
`get_centrifuge_specs(designation)` can serve a record straight out of it. The shape is
already stable and typed, the `fluid` field is mandatory on every capacity, and
`rejectedValues` gives a model server the ability to say "that number is wrong, here is the
right one and here is the ruling" rather than repeating a stale figure.

There is a separate, older endpoint at `/technical-data/centrifuges.v1.json` that carries
the OEM capacity-table provenance (source workbook hashes, L/h cells, conversion
methodology). The two complement each other: that one is about *where a capacity came
from*, this one is about *what Dolphin publishes*.

---

## What is deliberately still hand-typed

The OEM capacity rows on the disc-stack pages (WHPX 405 / 510 / 513, MOPX 207 / 209, MAB
103 / 104 and the MAB hub, and the DMPX and DMB module pages) still carry their L/h and
derived GPM values in the page source. That is not an oversight:
`canonical-capacity-pages.test.mjs` asserts those values against the technical registry by
reading the `.astro` source, and moving them into a component would blind that test. They
are covered twice over instead - by that test at the source level and by this guard at the
rendered level. Moving them into `SpecTable` is a follow-up that should land together with
switching that test to read `dist` instead of source.

---

## Open items needing an owner ruling

These are live contradictions the guard surfaced that no ruling covers. They are recorded
in the `notes` of their model records so they cannot be lost:

- **MAB-102 bowl speed.** `/smallest-industrial-centrifuges/` prose says 9,300 RPM; its own
  spec table says 9,375 RPM.
- **Sharples P-660 G-force.** The same page's prose says 3,070 Gs; its table says 3,050 Gs.
- **NX 416 motor.** The page table says 15 HP; its prose said 20 HP.
- **MOPX 207 bowl speed.** The DMPX-028 case study says 8,000 RPM; the model page says
  6,325 RPM.
- **NX 314 / NX 418 rated capacity on `/wastewater-centrifuge/`.** That comparison table
  gives 80 GPM and 170 GPM against 25 GPM and 110 GPM on the model pages.
- **Homepage disc-stack card** carries a class-wide "12,000 × g" badge, which E4 ruled
  against as a class-wide claim, but E4 named only the 8,000 / 10,000 / 12,000 Gs figures in
  prose and this is a badge, so it was left alone.
- **G2-40 G-force and AE.** 3,150 RCF and AE 1,565 match the pre-correction NX 418 values
  and look cloned. No ruling covers the G2-40.
- **DMPX-070 G-force** stays frozen and parked per A16. None is published.

---

## Adding a model

Add a record to the `models` array in `src/data/centrifugeSpecs.ts`. Set `canonicalPath` to
the page that owns its spec table, then render that table with `SpecTable`:

```astro
<SpecTable
  model="alfa-laval-nx-314"
  variant="collapse"
  rows={[
    { label: 'Model Type', field: 'modelType', firstCol: true },
    { label: 'Rated Capacity', capacity: 0 },
    { label: 'Drive Motor Power', field: 'motorHp' },
    { label: 'Conveyor Protection', field: 'conveyorProtection' },
  ]}
/>
```

`variant` reproduces each page's existing table styling (`plain`, `bare`, `striped-card`,
`collapse`). Add a variant rather than restyling a page. Rows the data file does not own -
page-specific options, notes, links - pass through literally with `value` or `html`, so
nothing is ever lost in the move.
