/**
 * ONE authoritative spec source per machine model.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Before this file, every machine number lived in the page that printed it, so the
 * same machine could carry three different capacities on three different pages. The
 * 2026-08-24 ruling worksheet (`docs/RULING_WORKSHEET.md`) settled ~60 of those
 * conflicts by hand. This file is the fix that keeps them settled: the numbers live
 * here once, the pages render them, and `scripts/spec-consistency-check.mjs` fails
 * the build if a page ever prints a value this file rejected.
 *
 * HOW TO CHANGE A NUMBER
 * ----------------------
 * Edit it here. Rebuild. If a page still shows the old number, the build fails and
 * tells you which page. See `docs/SPEC_SOURCE.md`.
 *
 * AUTHORITY ORDER (never invent a value; omit the field instead)
 * -------------------------------------------------------------
 *   1. `docs/RULING_WORKSHEET.md`  - the RULING: values, ruled 2026-08-24 by Sanjay.
 *   2. `src/data/centrifugeTechnicalRegistry.mjs` - the OEM capacity tables
 *      (reviewed 2026-08-28, i.e. AFTER the worksheet). Where the registry holds a
 *      source-backed L/h value for a machine, that value supersedes the worksheet's
 *      rounded GPM figure for the same duty, and the superseded figure is recorded
 *      in `notes` rather than published. Those capacities are IMPORTED from the
 *      registry below, not retyped, so the two files cannot drift apart.
 *   3. The model's own `/alfa-laval-*` page as currently shipped.
 *   4. `docs/DAYLIGHT_PLAN.md` model cross-reference for the DMPX/DMB mappings.
 *
 * A field with no source is absent. A field that is genuinely parked carries
 * `tbd: true` plus a note saying what is missing and why.
 */

import { technicalCatalog } from './centrifugeTechnicalRegistry.mjs';

/* ------------------------------------------------------------------ types */

export type MachineFamily = 'disc-stack' | 'decanter' | 'basket';

export type CapacityKind =
  /** A published rating for the named fluid. */
  | 'rated'
  /** A throughput Dolphin has actually run on the named duty. */
  | 'actual'
  /** A ceiling, not a working duty point. */
  | 'maximum'
  /** OEM rated reference with no process fluid identified. Never an application capacity. */
  | 'reference';

export type CapacityUnit = 'US GPM' | 'L/h' | 'm3/hr';

/** A number or an inclusive [min, max] range. */
export type Numeric = number | [number, number];

export interface Capacity {
  /**
   * MANDATORY. The whole lesson of the 2026-08 audit was that a flow number
   * without its fluid is not a fact. "Fluid not specified" is an acceptable
   * value; an absent one is not.
   */
  fluid: string;
  kind: CapacityKind;
  value: Numeric;
  unit: CapacityUnit;
  /** Derived US GPM where `unit` is not already US GPM. */
  derivedGpm?: Numeric;
  /** Viscosity / temperature / duty conditions as published. */
  conditions?: string;
  /**
   * The exact cell text this capacity is published as, where the page's own
   * phrasing should be preserved byte-for-byte. It MUST contain `value`; the
   * build guard cross-checks that, so a number can never be changed in one and
   * left stale in the other.
   */
  label?: string;
  /**
   * Page this capacity is published on, when that is not the model's
   * `canonicalPath`. The build guard asserts the value against this page instead.
   */
  assertOnPath?: string;
  /** Worksheet ruling id (A1, E21, ...) or registry provenance. */
  ruling?: string;
  note?: string;
}

export interface Dimension {
  value: Numeric;
  unit: 'in' | 'mm';
  /** The same dimension in the other unit, where the page publishes both. */
  alsoMm?: Numeric;
  alsoIn?: Numeric;
}

/** A historical value that is now WRONG for this model. The build fails if a page prints it near the model. */
export interface RejectedValue {
  /** The literal text as it would appear on a page, e.g. "50 GPM". Matched case-insensitively with flexible digit grouping. */
  text: string;
  /** Why it is wrong, and which ruling killed it. */
  reason: string;
  /**
   * A regular expression (source text, case-insensitive) that exempts a hit when
   * it appears in the surrounding sentence. Use this only where the ruling itself
   * permits the reading - for example A6 allows any NX 314 flow figure that is
   * printed with its real duty, and E7 allows a large weight that is explicitly
   * labelled as the SKID weight rather than the bare machine.
   */
  unless?: string;
}

export interface ModelSpec {
  id: string;
  /** e.g. "WHPX 405". The string a page must contain for the guard to scope its checks. */
  designation: string;
  /** Full nameplate string as published, e.g. "Alfa Laval WHPX 405 TGD 24-60". */
  modelType?: string;
  manufacturer: string;
  family: MachineFamily;
  /** Dolphin module this machine is the base for, e.g. "DMPX-014". */
  dolphinModule?: string;
  /** Other names the same machine is published under. */
  aliases?: string[];
  /** Site path whose spec table is this model's own. */
  canonicalPath?: string;

  capacities: Capacity[];
  /**
   * Set when the model deliberately publishes NO capacity number. The text is what
   * a page must say instead, e.g. "Sized per application". An empty `capacities`
   * array plus this field is a ruled absence, not a gap in the data.
   */
  capacityPolicy?: string;

  bowlSpeedRpm?: Numeric;
  /** Number of Gs, or a published qualified string such as "6,500+". */
  gForce?: Numeric | string;
  motorHp?: Numeric;
  /** Use when the motor cannot be reduced to a number. */
  motorNote?: string;
  bowlDiameter?: Dimension;
  bowlLength?: Dimension;
  sludgeVolumeGal?: Numeric;
  /** As published, e.g. "230 / 460 V, 3 phase". */
  voltages?: string;
  micronRating?: number;
  netWeightLb?: Numeric;
  /** As published, e.g. `30" x 38" x 43" (Bare Centrifuge)`. */
  dimensions?: string;

  /* decanter-specific */
  augerDifferentialRpm?: string;
  gearboxRatio?: string;
  areaEquivalent?: Numeric;
  beachAngle?: string;
  conveyorProtection?: string;

  /* disc-stack-specific */
  bowlType?: string;
  separationType?: string;
  wettedParts?: string;

  /** Parked items: what is missing and why. Present means at least one field is unresolved. */
  tbd?: boolean;
  notes?: string[];
  /** Worksheet ruling ids that govern this record. */
  rulings?: string[];
  /** Values that must never appear near this model again. */
  rejectedValues?: RejectedValue[];

  /**
   * Fields the build guard must NOT assert on this model's own page, because the
   * page legitimately does not print them. Every entry needs a reason in `notes`.
   */
  skipPageAssert?: Array<'capacity' | 'rpm' | 'hp'>;
}

/* ------------------------------------------------- registry capacity import */

type RegistryCapacity = {
  id: string;
  fluid: { name: string };
  ratingBasis: string;
  sourceValue: { value?: number; minimum?: number; maximum?: number; unit: string };
  derivedConversions: Array<{ value?: number; minimum?: number; maximum?: number; unit: string }>;
  conditions?: { sourceLabel?: string };
};

const registryModels = new Map<string, { capacities: RegistryCapacity[] }>(
  (technicalCatalog.models as Array<{ id: string; capacities: RegistryCapacity[] }>).map((m) => [m.id, m]),
);

function numeric(source: { value?: number; minimum?: number; maximum?: number }): Numeric {
  if (typeof source.value === 'number') return source.value;
  return [source.minimum as number, source.maximum as number];
}

/**
 * Pull a model's OEM capacity records straight out of the technical registry so
 * the two authoritative files can never disagree. `registryId` is the registry's
 * own model id, e.g. "alfa-laval-whpx-405".
 */
function fromRegistry(registryId: string): Capacity[] {
  const model = registryModels.get(registryId);
  if (!model) throw new Error(`centrifugeSpecs: no technical-registry record for ${registryId}`);
  return model.capacities.map((capacity) => {
    const gpm = capacity.derivedConversions.find((item) => item.unit === 'US GPM');
    return {
      fluid: capacity.fluid.name,
      kind: capacity.ratingBasis === 'oem-rated-reference' ? ('reference' as const) : ('rated' as const),
      value: numeric(capacity.sourceValue),
      unit: 'L/h' as const,
      ...(gpm ? { derivedGpm: numeric(gpm) } : {}),
      ...(capacity.conditions?.sourceLabel ? { conditions: capacity.conditions.sourceLabel } : {}),
      ruling: `technical registry ${capacity.id}`,
    };
  });
}

/* --------------------------------------------------------- shared fragments */

const CARBIDE = 'Carbide Tile or Tungsten Carbide Hard-Surfacing';
const AUGER_1_50 = '1 ~ 50 RPM';
const NX_GEARBOX = '1: 159 (2.5 kN-M)';
const V_230_460 = '230 / 460 V';
const V_230_460_3PH = '230 / 460 V, 3 phase';

/**
 * A6 permits a decanter flow figure that is printed with its real duty. This is
 * the "the page's real duty" clause: an explicit sludge percentage, a wastewater
 * duty, a named thickening service, or a passage that is plainly about a
 * disc-stack machine standing next to a decanter mention.
 */
const DUTY_LABELLED = 'disc[\\s-]?stack|sludge|thickening|waste ?water|humate|humus';

/** Every reference to these codes is a bug. Ruled 2026-08-24 (B1, B2, B3). */
export const retiredDesignations: RejectedValue[] = [
  { text: 'DMSC-042', reason: 'B2: the DMSC-042 code is retired. Say "DMPX-042 acid-service configuration".' },
  { text: 'SSB-206', reason: 'B3: SSB-206 is not a real code. Say "stainless steel configuration of the Alfa Laval MAB 206".' },
  { text: 'CBPX-213-XP', reason: 'B1: the clarifier is the BRPX 213. CBPX-213-XP was never a designation.' },
];

/* ------------------------------------------------------------------ models */

export const models: ModelSpec[] = [
  /* ================================================= disc-stack: WHPX frame */
  {
    id: 'alfa-laval-whpx-405',
    designation: 'WHPX 405',
    modelType: 'Alfa Laval WHPX 405 TGD 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-014',
    canonicalPath: '/alfa-laval-whpx-405/',
    capacities: fromRegistry('alfa-laval-whpx-405'),
    bowlSpeedRpm: 7600,
    gForce: 7200,
    motorHp: 5,
    sludgeVolumeGal: 0.36,
    voltages: V_230_460,
    micronRating: 0.5,
    bowlType: 'Automatic partial-discharge / self-cleaning',
    separationType: 'Three-phase (oil / water / solids)',
    rulings: ['A1', 'A2', 'A3', 'A5', 'E4', 'F7'],
    notes: [
      'A1/A2 ruled 15 GPM on 13 cSt diesel and 23 GPM rated. Both were rounded stand-ins for the OEM table. The 2026-08-28 capacity pass replaced them on the page with the source values 3,700 L/h (16.29 US GPM) diesel and 5,500 L/h (24.22 US GPM) rated reference, which is the same lineage stated precisely. The registry values are canonical.',
      'A3/A5: 7,600 RPM and 7,200 Gs. The 7,200 Gs figure only computes at 7,600 RPM, which is why 8,500 RPM was rejected.',
      'F7: ATEX Zone 2 hazardous-area configurations are available and are backed by a photographed DMPX-014 skid.',
    ],
    rejectedValues: [
      { text: '8,500 RPM', reason: 'A3: 8,500 RPM is a MAB-frame figure, not the WHPX 405 frame.' },
      { text: '12,000 Gs', reason: 'A5/E4: no machine on the site develops 12,000 Gs. The WHPX 405 frame is 7,200 Gs.' },
      { text: '10,000 Gs', reason: 'E4: class-wide G-force claims removed. Quote per model.' },
    ],
  },
  {
    id: 'alfa-laval-whpx-407',
    designation: 'WHPX 407',
    modelType: 'Alfa Laval WHPX 407 TGD 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-028',
    canonicalPath: '/alfa-laval-mopx-207-centrifuge/',
    capacities: fromRegistry('alfa-laval-whpx-407'),
    bowlSpeedRpm: 7125,
    motorHp: 10,
    sludgeVolumeGal: 1.3,
    voltages: V_230_460,
    bowlType: 'Automatic partial-discharge / self-cleaning',
    rulings: ['B5', 'B7', 'B8'],
    notes: [
      'B5/B8: MOPX 207 is the primary DMPX-028 base machine; WHPX 407 stays named as the equivalent.',
      'B7: the DMPX-028 photo caption legitimately says WHPX-407 because that is the machine in the photo.',
    ],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-whpx-409',
    designation: 'WHPX 409',
    modelType: 'Alfa Laval WHPX 409 TGD 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-042',
    canonicalPath: '/alfa-laval-mopx-209-centrifuge/',
    capacities: fromRegistry('alfa-laval-whpx-409'),
    bowlSpeedRpm: 7125,
    motorHp: 12.5,
    sludgeVolumeGal: 1.3,
    voltages: V_230_460,
    bowlType: 'Automatic partial-discharge / self-cleaning',
  },
  {
    id: 'alfa-laval-whpx-510',
    designation: 'WHPX 510',
    modelType: 'Alfa Laval WHPX 510 TGD 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-042',
    canonicalPath: '/alfa-laval-whpx-510-centrifuge/',
    capacities: fromRegistry('alfa-laval-whpx-510'),
    bowlSpeedRpm: 5180,
    motorHp: 10,
    sludgeVolumeGal: 1.62,
    voltages: V_230_460_3PH,
    bowlType: 'Automatic partial-discharge / self-cleaning',
    separationType: 'Three-phase (oil / water / solids)',
    rulings: ['E10', 'B8'],
    notes: [
      'E10: the WHPX 510 class publishes NO water-based coolant capacity. Coolant duty is sized per application. The 28 GPM coolant figure belongs to the DMPX-028 / MOPX 207.',
      'The 42 GPM figure that circulates for this size class belongs to the MAPX 210 (A20) and is not a WHPX 510 diesel capacity.',
    ],
    rejectedValues: [
      { text: '32 GPM', reason: 'E10: the WHPX 510 coolant GPM claims were removed. Coolant is sized per application.' },
      { text: '50 GPM', reason: 'E10: unsupported WHPX 510 coolant figure.' },
    ],
  },
  {
    id: 'alfa-laval-whpx-513',
    designation: 'WHPX 513',
    modelType: 'Alfa Laval WHPX 513 TGD 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-070',
    canonicalPath: '/alfa-laval-whpx-513/',
    capacities: fromRegistry('alfa-laval-whpx-513'),
    motorHp: 15,
    sludgeVolumeGal: 3.87,
    voltages: V_230_460_3PH,
    bowlType: 'Automatic partial-discharge / self-cleaning',
    tbd: true,
    rulings: ['A4', 'A16', 'E16', 'R5-8'],
    notes: [
      'A4: 72 GPM on 13 cSt diesel. The page states it as the source value 16,400 L/h (72.21 US GPM derived), which is the same number precisely.',
      'A16 / R5-8: gForce is INTENTIONALLY UNPUBLISHED for this frame. Owner ruling 2026-08-29: not published.',
      'Bowl speed is not published for the bare WHPX 513. The DMPX-070 module page gives the module band 4,100-4,150 RPM.',
      'E16: 72 GPM on the DMPX-070 / WHPX 513 is the site top capacity for black diesel.',
    ],
    rejectedValues: [
      { text: '50 GPM', reason: 'A4: rejected. The diesel figure is 16,400 L/h (72.21 US GPM).' },
      { text: '60 GPM', reason: 'A4: rejected. The diesel figure is 16,400 L/h (72.21 US GPM).' },
    ],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-fopx-613',
    designation: 'FOPX 613',
    modelType: 'Alfa Laval FOPX 613 TGD 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-070',
    canonicalPath: '/alfa-laval-whpx-513/',
    capacities: [
      {
        fluid: 'Heavy fuel oil, 380 cSt',
        kind: 'rated',
        value: 30,
        unit: 'US GPM',
        label: '30 GPM on 380 cSt Heavy Fuel oil (HFO)',
      },
    ],
    motorHp: 15,
    sludgeVolumeGal: 3.95,
    voltages: V_230_460,
    notes: ['Explosion-proof sibling of the WHPX 513 in the DMPX-070 size class.'],
    skipPageAssert: ['rpm'],
  },

  /* ================================================= disc-stack: MOPX frame */
  {
    id: 'alfa-laval-mopx-205',
    designation: 'MOPX 205',
    modelType: 'Alfa Laval MOPX 205 TGT 20-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-014',
    canonicalPath: '/alfa-laval-whpx-405/',
    capacities: fromRegistry('alfa-laval-mopx-205'),
    motorHp: 4,
    sludgeVolumeGal: 0.38,
    voltages: V_230_460,
    bowlType: 'Total-discharge',
    rulings: ['E1'],
    notes: [
      'E1 ruled 21 GPM against a 25 GPM alternative. The 2026-08-28 capacity pass replaced the single rounded figure with the fluid-labelled OEM records (gas oil 4,900 L/h, diesel 3,300 L/h, R&O / engine lube 1,700 L/h, steam turbine 3,200 L/h). Those are canonical.',
    ],
    rejectedValues: [
      { text: '25 GPM', reason: 'E1: rejected for the MOPX 205. Its published records are fluid-labelled L/h values.' },
    ],
    skipPageAssert: ['rpm', 'hp'],
  },
  {
    id: 'alfa-laval-mopx-207',
    designation: 'MOPX 207',
    modelType: 'Alfa Laval MOPX 207 TGT',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-028',
    canonicalPath: '/alfa-laval-mopx-207-centrifuge/',
    capacities: fromRegistry('alfa-laval-mopx-207'),
    bowlSpeedRpm: 6325,
    motorHp: 7.5,
    sludgeVolumeGal: 1.0,
    voltages: '230 / 460 V; 3-Phase',
    netWeightLb: 1800,
    dimensions: '30" x 38" x 43" (Bare Centrifuge)',
    bowlType: 'Automatic self-cleaning',
    separationType: 'Three-phase (oil / water / solids)',
    rulings: ['E2', 'B5', 'C7', 'E10', 'R5-4'],
    notes: [
      'E2 ruled 34 GPM against 30 GPM. The 2026-08-28 pass replaced it with the fluid-labelled OEM records; diesel is 5,000 L/h (22.01 US GPM derived) and gas oil 7,400 L/h (32.58 US GPM derived).',
      'C7/A17: the 28 GPM quench-oil and coolant figure belongs to this machine (DMPX-028), not to the DMPX-014 skid photographed on the quench page, and not to the WHPX 510.',
      'R5-4 (ruled 2026-08-29): the MOPX 207 bowl speed is 6,325 RPM. The 8,000 RPM in the DMPX-028 case study was the error and was corrected. 8,000 RPM stays legitimate for other frames, so the rejection below is scoped to this record only.',
    ],
    rejectedValues: [
      { text: '30 GPM', reason: 'E2: rejected for the MOPX 207.' },
      { text: '8,000 RPM', reason: 'R5-4: rejected for the MOPX 207. Its bowl speed is 6,325 RPM.' },
    ],
  },
  {
    id: 'alfa-laval-mopx-209',
    designation: 'MOPX 209',
    modelType: 'Alfa Laval MOPX 209 TGT 20-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-042',
    canonicalPath: '/alfa-laval-mopx-209-centrifuge/',
    capacities: fromRegistry('alfa-laval-mopx-209'),
    bowlSpeedRpm: 5180,
    motorHp: 15,
    sludgeVolumeGal: 2.0,
    voltages: V_230_460,
    bowlType: 'Automatic self-cleaning',
    rulings: ['B4', 'C2'],
    notes: ['C2: the DMPX-042 skid photo is confirmed by eye to be a MOPX 209.'],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-mopx-210',
    designation: 'MOPX 210',
    modelType: 'Alfa Laval MOPX 210 TGT 20-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-042',
    canonicalPath: '/centrifuges/dmpx-042/',
    capacities: fromRegistry('alfa-laval-mopx-210'),
    bowlType: 'Automatic self-cleaning',
    rulings: ['B4', 'R5-6'],
    notes: [
      'B4: MOPX-210, not MAPX-210, owns the spec table on /diesel-centrifuge/.',
      'The /diesel-centrifuge/ MOPX-210 skid table publishes 30 GPM on diesel and 10 HP for a complete Dolphin skid. The OEM bare-machine diesel record for this frame is 9,400 L/h (41.39 US GPM derived). The two are different scopes; neither is asserted against the other.',
      'R5-6 (ruled 2026-08-29): the homepage disc-stack category card is illustrated with and captioned as a MOPX-210, so this record is the one the build guard scopes that card to. Its "12,000 x g" class badge was replaced with "up to 8,500 Gs depending on model" (8,500 Gs = MAB-102, the highest disc-stack G-force the site publishes).',
    ],
    rejectedValues: [
      { text: '12,000', reason: 'R5-6: rejected as a disc-stack class G-force claim. The site ceiling is 8,500 Gs on the MAB-102.' },
    ],
    skipPageAssert: ['rpm', 'hp'],
  },
  {
    id: 'alfa-laval-mopx-213',
    designation: 'MOPX 213',
    modelType: 'Alfa Laval MOPX 213 TGT 20-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-070',
    canonicalPath: '/centrifuges/dmpx-070/',
    capacities: [
      ...fromRegistry('alfa-laval-mopx-213'),
      {
        fluid: 'Used engine oil',
        kind: 'actual',
        value: 40,
        unit: 'US GPM',
        conditions: 'at 180 °F',
        label: '40 GPM on used engine oil at 180 °F',
        assertOnPath: '/alfa-laval-whpx-513/',
        note: 'Dolphin application figure, not an OEM record. Published on /alfa-laval-whpx-513/.',
      },
    ],
    motorHp: 15,
    sludgeVolumeGal: 3.61,
    voltages: V_230_460,
    bowlType: 'Automatic self-cleaning',
    notes: [
      'The Dolphin application figure (40 GPM on used engine oil at 180 F, 15 HP, 3.61 gal sludge space) is published on /alfa-laval-whpx-513/ and is a duty figure, not an OEM record. The OEM records above come from the capacity registry.',
    ],
    skipPageAssert: ['rpm', 'hp'],
  },
  {
    id: 'alfa-laval-mopx-310',
    designation: 'MOPX 310',
    modelType: 'Alfa Laval MOPX 310 TGT 20-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-042',
    canonicalPath: '/alfa-laval-whpx-510-centrifuge/',
    capacities: [
      {
        fluid: 'Used oil',
        kind: 'rated',
        value: 25,
        unit: 'US GPM',
        conditions: 'at 180 °F',
        label: '25 GPM on Used Oil @ 180 °F',
        note: 'Dolphin application figure. Kept separate from the WHPX 510 OEM capacity table.',
      },
    ],
    bowlSpeedRpm: 5180,
    motorHp: 10,
    sludgeVolumeGal: 1.55,
    voltages: V_230_460,
    bowlType: 'Automatic self-cleaning',
    separationType: 'Three-phase (oil / water / solids)',
    rejectedValues: [
      { text: '42 GPM', reason: 'The 42 GPM figure is the MAPX 210 ruling (A20). The MOPX 310 figure is 25 GPM on used oil at 180 F.' },
    ],
  },
  {
    id: 'alfa-laval-mapx-309',
    designation: 'MAPX 309',
    modelType: 'Alfa Laval MAPX 309 BGT-14',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/alfa-laval-mopx-209-centrifuge/',
    capacities: [],
    motorHp: 10,
    sludgeVolumeGal: 2.1,
    voltages: V_230_460,
    tbd: true,
    notes: [
      'No OEM capacity record exists for the MAPX 309 in the technical registry, so no flow value is published and no MOPX 209 or WHPX 409 value may be transferred to it.',
    ],
    skipPageAssert: ['capacity', 'rpm'],
  },

  /* ================================================= disc-stack: MAPX frame */
  {
    id: 'alfa-laval-mapx-207',
    designation: 'MAPX 207',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-028',
    canonicalPath: '/disc-stack-centrifuge-rental/',
    capacities: [
      { fluid: 'Diesel fuel', kind: 'rated', value: 28, unit: 'US GPM', ruling: 'A19' },
    ],
    motorHp: 7.5,
    motorNote: '460 V / 3 Ph - 7.5 HP motor',
    bowlType: 'Automatic self-cleaning',
    rulings: ['A19'],
    notes: ['A19: MAPX 207 = 28 GPM. The 22 GPM figure was removed. Alkaline-media variant of the same 207 bowl class as the MOPX 207 and WHPX 407.'],
    rejectedValues: [
      { text: '22 GPM', reason: 'A19: rejected. The MAPX 207 figure is 28 GPM.' },
    ],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-mapx-210',
    designation: 'MAPX 210',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMPX-042',
    canonicalPath: '/disc-stack-centrifuge-rental/',
    capacities: [
      {
        fluid: 'Fluid not stated in the ruling',
        kind: 'rated',
        value: 42,
        unit: 'US GPM',
        ruling: 'A20',
        note: 'PARKED: A20 ruled the number 42 GPM but did not attach a fluid. Until a fluid is ruled, publish it only as the rental machine size and never as a diesel or water capacity.',
      },
    ],
    bowlType: 'Automatic self-cleaning',
    tbd: true,
    rulings: ['A20', 'B4', 'B8'],
    notes: [
      'A20 ruled 42 GPM. The fluid label is still parked, which is why the capacity record carries no duty.',
      'B4: where a spec table is shown for this size class the MOPX-210 owns it; MAPX 210 stays named as the equivalent.',
    ],
    rejectedValues: [
      { text: '47 GPM', reason: 'A20: rejected. The MAPX 210 figure is 42 GPM.' },
    ],
    skipPageAssert: ['rpm', 'hp'],
  },

  /* ================================================== disc-stack: MAB frame */
  {
    id: 'alfa-laval-mab-102',
    designation: 'MAB-102',
    modelType: 'Alfa Laval MAB-102',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    aliases: ['MAB 102'],
    canonicalPath: '/smallest-industrial-centrifuges/',
    capacities: [
      { fluid: 'Diesel fuel', kind: 'rated', value: 2, unit: 'US GPM', label: '2 GPM on Diesel Fuel' },
    ],
    bowlSpeedRpm: 9375,
    gForce: 8500,
    motorHp: 0.5,
    netWeightLb: 100,
    dimensions: '18" x 25" x 12"',
    micronRating: 0.5,
    bowlType: 'Manual-clean / solid-retaining',
    separationType: 'Three-phase (oil / water / solids)',
    rulings: ['E15', 'R5-1'],
    notes: [
      'E15: 8,500 Gs. The "over 9,000 Gs" claim was rejected.',
      'R5-1 (ruled 2026-08-29): the MAB-102 bowl speed is 9,375 RPM. The 9,300 RPM prose on /smallest-industrial-centrifuges/ was the error and was corrected to match the table.',
      'R5-6 (ruled 2026-08-29): 8,500 Gs is the highest disc-stack G-force the site publishes, which is why the homepage class badge now reads "up to 8,500 Gs depending on model".',
    ],
    rejectedValues: [
      { text: '9,000 Gs', reason: 'E15: rejected. The MAB-102 figure is 8,500 Gs.' },
      { text: '9,300 RPM', reason: 'R5-1: rejected. The MAB-102 bowl speed is 9,375 RPM.' },
      { text: '12,000 Gs', reason: 'R5-6: rejected. No disc-stack machine on the site develops 12,000 Gs; the ceiling is the MAB-102 at 8,500 Gs.' },
    ],
  },
  {
    id: 'alfa-laval-mab-103',
    designation: 'MAB 103',
    modelType: 'Alfa Laval MAB 103 B 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMB-004',
    canonicalPath: '/alfa-laval-mab-103-centrifuge/',
    capacities: fromRegistry('alfa-laval-mab-103'),
    bowlSpeedRpm: 8600,
    motorHp: 1,
    sludgeVolumeGal: 0.14,
    voltages: '230 / 460 V or 110 V Single Phase',
    netWeightLb: 250,
    dimensions: '24" x 30" x 26" (Bare Centrifuge)',
    micronRating: 0.5,
    bowlType: 'Manual-clean / solid-retaining',
    rulings: ['A12', 'A13', 'E7', 'B10', 'F6'],
    notes: [
      'A12 ruled 4 GPM on diesel for the DMB-004 module and the bare machine alike; A13 ruled 2.5 GPM turbine lube. The 2026-08-28 pass replaced both with the fluid-labelled OEM records (diesel 900 L/h, steam turbine lube 800 L/h). Those are canonical.',
      'E7: 250 lbs bare machine. Skid weight is stated separately. The 110 V single-phase option EXISTS and is published.',
      'B10: DMB-007 maps to the MAB 104, not the MAB 103.',
      'F6: hazardous-area wording is "ATEX Zone 2 (non-sparking) configuration", never "explosion-proof ATEX Zone II".',
    ],
    rejectedValues: [
      { text: '800 lbs', reason: 'E7: the bare MAB 103 is 250 lbs. State skid weight separately.', unless: 'skid' },
      { text: '1,500 lbs', reason: 'E7: the bare MAB 103 is 250 lbs. State skid weight separately.', unless: 'skid' },
      { text: 'Zone II', reason: 'F6: write "ATEX Zone 2 (non-sparking) configuration".' },
    ],
  },
  {
    id: 'alfa-laval-mab-104',
    designation: 'MAB 104',
    modelType: 'Alfa Laval MAB 104 B 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMB-007',
    canonicalPath: '/alfa-laval-mab-104-centrifuge/',
    capacities: fromRegistry('alfa-laval-mab-104'),
    bowlSpeedRpm: 7500,
    motorHp: 2,
    sludgeVolumeGal: 0.25,
    voltages: V_230_460,
    micronRating: 0.5,
    bowlType: 'Manual-clean / solid-retaining',
    rulings: ['B10', 'E16', 'F6'],
    notes: [
      'B10: DMB-007 = MAB 104 per the CENTRIFUGE_BRAIN cross-reference.',
      'E16: the MAB 104 (DMB-007) at 2 GPM is the smallest black-diesel system Dolphin offers. The 5 GPM small-system claims were removed.',
      'F6: hazardous-area wording is "ATEX Zone 2 (non-sparking) configuration".',
    ],
    rejectedValues: [
      { text: 'Zone II', reason: 'F6: write "ATEX Zone 2 (non-sparking) configuration".' },
    ],
  },
  {
    id: 'alfa-laval-mab-204',
    designation: 'MAB 204',
    modelType: 'Alfa Laval MAB 204S-24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMB-013',
    canonicalPath: '/alfa-laval-mab-centrifuge/',
    capacities: fromRegistry('alfa-laval-mab-204'),
    motorHp: 4,
    sludgeVolumeGal: 0.4,
    voltages: V_230_460,
    bowlType: 'Manual-clean / solid-retaining',
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-mab-205',
    designation: 'MAB 205',
    modelType: 'Alfa Laval MAB 205S-24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMB-019',
    canonicalPath: '/alfa-laval-mab-centrifuge/',
    capacities: fromRegistry('alfa-laval-mab-205'),
    motorHp: 5,
    sludgeVolumeGal: 0.48,
    voltages: V_230_460,
    bowlType: 'Manual-clean / solid-retaining',
    rulings: ['E6'],
    notes: [
      'E6 ruled 19 GPM diesel / 29 GPM rated / 10 GPM lube R&O, each printed with its fluid. The 2026-08-28 pass states the same three duties as source values: diesel 4,400 L/h (19.37 US GPM), rated reference 6,500 L/h (28.62 US GPM), R&O lube 2,000-2,300 L/h (8.81-10.13 US GPM).',
    ],
    rejectedValues: [
      { text: '18 GPM', reason: 'E6: an unlabelled MAB 205 figure. Each duty is now printed with its fluid.' },
    ],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-mab-206',
    designation: 'MAB 206',
    modelType: 'Alfa Laval MAB 206S-24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMB-028',
    canonicalPath: '/alfa-laval-mab-centrifuge/',
    capacities: fromRegistry('alfa-laval-mab-206'),
    motorHp: 7.5,
    sludgeVolumeGal: 0.88,
    voltages: V_230_460,
    bowlType: 'Manual-clean / solid-retaining',
    rulings: ['E5', 'B3'],
    notes: [
      'E5: the MAB 206 motor is 5 HP or larger; the 2 HP figure printed against 25 GPM was the error. The MAB hub publishes 7.5 HP for the 206S frame. E5 ruled only the motor figure; the MOPX-205 10 GPM figure named in the same line was NOT ruled and is therefore not rejected anywhere.',
      'B3: the stainless build is "the stainless steel configuration of the Alfa Laval MAB 206". SSB-206 is not a code.',
    ],
    rejectedValues: [
      { text: '2 HP', reason: 'E5: the 2 HP MAB 206 figure was an error.' },
    ],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-mab-207',
    designation: 'MAB 207',
    modelType: 'Alfa Laval MAB 207S-24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMB-037',
    canonicalPath: '/alfa-laval-mab-centrifuge/',
    capacities: fromRegistry('alfa-laval-mab-207'),
    motorHp: 10,
    sludgeVolumeGal: 1.1,
    voltages: V_230_460,
    bowlType: 'Manual-clean / solid-retaining',
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-mab-209',
    designation: 'MAB 209',
    modelType: 'Alfa Laval MAB 209S-24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: 'DMB-062',
    canonicalPath: '/alfa-laval-mab-centrifuge/',
    capacities: fromRegistry('alfa-laval-mab-209'),
    motorHp: 15,
    sludgeVolumeGal: 2.0,
    voltages: V_230_460,
    bowlType: 'Manual-clean / solid-retaining',
    rulings: ['C9'],
    notes: ['C9: photo refresh is on hold until the new MAB 209 skid is shot.'],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-wsb-203',
    designation: 'WSB 203',
    modelType: 'Alfa Laval WSB 203 70',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/alfa-laval-mab-103-centrifuge/',
    capacities: [
      {
        fluid: 'Parts-washer fluid',
        kind: 'actual',
        value: 1,
        unit: 'US GPM',
        note: 'Dolphin application figure; outside the current OEM capacity registry.',
      },
    ],
    motorHp: 1,
    sludgeVolumeGal: 0.14,
    voltages: V_230_460,
    wettedParts: 'Stainless steel',
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-wsb-104',
    designation: 'WSB 104',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/alfa-laval-mab-104-centrifuge/',
    capacities: [
      {
        fluid: 'Water-soluble machining coolant',
        kind: 'actual',
        value: 2,
        unit: 'US GPM',
        note: 'Dolphin application figure; outside the current OEM capacity registry.',
      },
    ],
    motorHp: 2,
    voltages: V_230_460,
    wettedParts: 'Stainless steel',
    notes: ['Stainless-steel variant of the MAB 104 frame.'],
    skipPageAssert: ['rpm', 'hp'],
  },

  /* ============================================ disc-stack: WSPX (coolant) */
  {
    id: 'alfa-laval-wspx-207',
    designation: 'WSPX 207',
    modelType: 'Alfa Laval WSPX 207 TGP-74',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/alfa-laval-wspx-207-self-cleaning-coolant-centrifuge/',
    capacities: [
      { fluid: 'Water-based machining coolant', kind: 'rated', value: 20, unit: 'US GPM', ruling: 'A21', label: '20 GPM' },
    ],
    bowlSpeedRpm: 6300,
    gForce: '6,500+ Gs',
    motorHp: 7.5,
    sludgeVolumeGal: 0.82,
    voltages: '230 / 460 V; 3-Phase',
    bowlType: 'Self-Cleaning (Automatic Discharge)',
    separationType: '3-Phase (Liquid-Liquid-Solid)',
    wettedParts: 'All Stainless Steel',
    rulings: ['A21', 'A23'],
    notes: ['A21/A23: WSPX 207 is the series entry point at 20 GPM. Series order is 207 -> 303 -> 307 -> 407.'],
    rejectedValues: [
      { text: '32 GPM', reason: 'A21: rejected. WSPX 207 = 20 GPM.' },
    ],
  },
  {
    id: 'alfa-laval-wspx-303',
    designation: 'WSPX 303',
    modelType: 'Alfa Laval WSPX 303 TGD',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/alfa-laval-wspx-303-centrifuge/',
    capacities: [],
    capacityPolicy: 'Sized per application on water-based coolant',
    bowlSpeedRpm: 9200,
    gForce: '8,000+',
    motorHp: 4,
    sludgeVolumeGal: 0.14,
    voltages: V_230_460,
    tbd: true,
    rulings: ['A21', 'A23', 'B9'],
    notes: [
      'A21/A23: WSPX 303 publishes NO capacity number. Every GPM claim reads "sized per application".',
      'The "303 mid at 8 GPM" claim was removed.',
      'B9: no Dolphin house code maps to the WSPX series. That did not block A21-A23.',
    ],
    rejectedValues: [
      { text: '8 GPM', reason: 'A23: rejected. The WSPX 303 publishes no capacity number.' },
    ],
    skipPageAssert: ['capacity'],
  },
  {
    id: 'alfa-laval-wspx-307',
    designation: 'WSPX 307',
    modelType: 'Alfa Laval WSPX 307 TGD',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/alfa-laval-wspx-307/',
    capacities: [
      { fluid: 'Water-based machining coolant', kind: 'rated', value: 28, unit: 'US GPM', ruling: 'A22', label: '28 GPM' },
    ],
    bowlSpeedRpm: 8600,
    gForce: '7,000+',
    motorHp: 10,
    sludgeVolumeGal: 0.87,
    voltages: V_230_460,
    bowlType: 'Self-Cleaning (Automatic Discharge)',
    rulings: ['A22', 'A23'],
    notes: ['A22/A23: WSPX 307 = 28 GPM, sitting above the 207 in the series.'],
    rejectedValues: [
      { text: '22 GPM', reason: 'A22: rejected. WSPX 307 = 28 GPM.' },
    ],
  },
  {
    id: 'alfa-laval-wspx-407',
    designation: 'WSPX 407',
    modelType: 'Alfa Laval WSPX 407 TGD',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/alfa-laval-wspx-407/',
    capacities: [],
    capacityPolicy: 'Sized per application',
    bowlSpeedRpm: 8500,
    gForce: '7,000+',
    motorHp: 10,
    sludgeVolumeGal: 0.87,
    voltages: V_230_460,
    bowlType: 'Self-Cleaning (Automatic Discharge)',
    separationType: '3-Phase (Liquid-Liquid-Solid)',
    tbd: true,
    rulings: ['A21', 'A23'],
    notes: ['A21/A23: WSPX 407 publishes NO capacity number. It is the top of the series and is sized per application.'],
    skipPageAssert: ['capacity'],
  },

  /* ================================== disc-stack: stainless / food / biotech */
  {
    id: 'alfa-laval-afpx-213',
    designation: 'AFPX 213',
    modelType: 'Alfa Laval AFPX 213 XGD 14-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/stainless-steel-centrifuge/',
    capacities: [
      { fluid: 'Water', kind: 'maximum', value: 100, unit: 'US GPM', label: '100 GPM on Water' },
      { fluid: 'Hemp Ethanol Polishing', kind: 'rated', value: 50, unit: 'US GPM', label: '50 GPM on Hemp Ethanol Polishing' },
    ],
    bowlSpeedRpm: 4150,
    gForce: 7200,
    motorHp: 15,
    sludgeVolumeGal: 3.87,
    voltages: V_230_460,
    dimensions: "5' x 7' x 7' (H)",
    wettedParts: '316L stainless steel',
    rulings: ['E8'],
    notes: ['E8: 4,150 RPM. Prose, spec table and schema are aligned on it.'],
    rejectedValues: [
      { text: '4,600 RPM', reason: 'E8: rejected. The AFPX 213 runs at 4,150 RPM.' },
    ],
  },
  {
    id: 'alfa-laval-afpx-207',
    designation: 'AFPX 207',
    modelType: 'Alfa Laval AFPX 207 70S',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/stainless-steel-centrifuge/',
    capacities: [
      { fluid: 'Animal Fat Rendering', kind: 'rated', value: 20, unit: 'US GPM', conditions: 'at 180 °F', label: '20 GPM on Animal Fat Rendering @ 180 F' },
    ],
    bowlSpeedRpm: 6400,
    motorHp: 10,
    sludgeVolumeGal: 1.12,
    voltages: V_230_460,
    wettedParts: '316L stainless steel',
    separationType: 'Three-phase',
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-brpx-213',
    designation: 'BRPX 213',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    aliases: ['BRPX-213'],
    capacities: [],
    gForce: 6500,
    micronRating: 0.5,
    wettedParts: 'Stainless steel',
    tbd: true,
    rulings: ['B1', 'E11'],
    notes: [
      'B1: the clarifier is the BRPX 213. The CBPX-213-XP designation is retired.',
      'E11: the BRPX frame develops 6,500 Gs. The "over 7,000 Gs" prose was the round-up.',
      'No dedicated spec table is published for the BRPX 213; it appears as a named machine on the food-grade and parts pages.',
    ],
  },
  {
    id: 'alfa-laval-brpx-313',
    designation: 'BRPX 313',
    modelType: 'Alfa Laval BRPX 313 SGT 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/stainless-steel-centrifuge/',
    capacities: [
      { fluid: 'CBD Ethanol Clarification', kind: 'rated', value: 50, unit: 'US GPM', label: '50 GPM on CBD Ethanol Clarification' },
      { fluid: 'Beer', kind: 'rated', value: 40, unit: 'US GPM', assertOnPath: '/beer-wine-centrifuge/', note: 'Published on /beer-wine-centrifuge/.' },
    ],
    gForce: 6500,
    motorHp: 15,
    sludgeVolumeGal: 3.87,
    voltages: V_230_460,
    micronRating: 0.5,
    wettedParts: '316L stainless steel',
    rulings: ['E11'],
    notes: ['E11: 6,500 Gs. The page spec table is the specific source; the "over 7,000 Gs" prose was a round-up and is rejected.'],
    rejectedValues: [
      {
        text: '7,000 Gs',
        reason: 'E11: rejected. The BRPX 313 develops 6,500 Gs.',
        unless: 'disc[\\s-]?stack centrifuges',
      },
    ],
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-brpx-309',
    designation: 'BRPX 309',
    modelType: 'Alfa Laval BRPX 309 SGT 24-60',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    canonicalPath: '/stainless-steel-centrifuge/',
    capacities: [
      { fluid: 'Beer, Wine, and Cider Clarification', kind: 'rated', value: 30, unit: 'US GPM', label: '30 GPM on Beer, Wine, and Cider Clarification' },
    ],
    motorHp: 10,
    sludgeVolumeGal: 1.35,
    voltages: V_230_460,
    wettedParts: '316L stainless steel',
    skipPageAssert: ['rpm'],
  },
  {
    id: 'alfa-laval-btpx-205',
    designation: 'BTPX 205',
    modelType: 'Alfa Laval BTPX-205',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    aliases: ['BTPX-205', 'BTPX 205 SGD-34-CDP'],
    canonicalPath: '/alfa-laval-btpx-205-biotech-centrifuge/',
    capacities: [
      { fluid: 'Pharma Cell Broth', kind: 'rated', value: 5, unit: 'US GPM', label: '5 GPM on Pharma Cell Broth' },
    ],
    bowlSpeedRpm: 9650,
    gForce: 12800,
    motorHp: 7.5,
    sludgeVolumeGal: 0.25,
    voltages: V_230_460,
    wettedParts: 'Stainless steel',
  },
  {
    id: 'alfa-laval-lapx-404',
    designation: 'LAPX-404',
    modelType: 'Alfa Laval LAPX-404',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    aliases: ['LAPX 404'],
    canonicalPath: '/alfa-laval-lapx-404-disc-centrifuge/',
    capacities: [
      { fluid: 'Chicken Broth / Chicken Fat Separation', kind: 'rated', value: 5, unit: 'US GPM', label: '5 GPM on Chicken Broth / Chicken Fat Separation' },
    ],
    bowlSpeedRpm: 8200,
    gForce: 8000,
    motorHp: 5,
    sludgeVolumeGal: 0.25,
    voltages: V_230_460,
    wettedParts: 'Stainless steel',
    rulings: ['D4'],
    notes: [
      'D4: the Clara 20 spec heading names LAPX-404 alongside it.',
      'The bare LAPX-404 record here (8,200 RPM, 8,000 Gs, 5 GPM chicken broth) is a different scope from the Clara 20 MODULE record (9,512 RPM, 11,130 g, 17.6 GPM high flow). Both are published; they are not alternatives to each other.',
    ],
  },
  {
    id: 'alfa-laval-clara-20',
    designation: 'Clara 20',
    manufacturer: 'Alfa Laval',
    family: 'disc-stack',
    dolphinModule: undefined,
    aliases: ['Clara 20 / LAPX-404'],
    canonicalPath: '/alfa-laval-clara-20-food-grade-centrifuge/',
    capacities: [
      { fluid: 'Food-grade liquid, high-flow configuration', kind: 'maximum', value: 17.6, unit: 'US GPM', conditions: '4,000 l/h', label: '17.6 GPM (4,000 l/h)' },
      { fluid: 'Food-grade liquid, low-flow configuration', kind: 'maximum', value: 4.4, unit: 'US GPM', conditions: '1,000 l/h', label: '4.4 GPM (1,000 l/h)' },
    ],
    bowlSpeedRpm: 9512,
    gForce: 11130,
    motorHp: 5,
    sludgeVolumeGal: 0.3,
    netWeightLb: 827,
    dimensions: '59" x 31.5" x 57"',
    wettedParts: 'Stainless steel',
    rulings: ['D4'],
    notes: [
      'Clara 20 is the module built on the LAPX-404 platform. Its figures are module figures and are not interchangeable with the bare LAPX-404 record.',
      'Bowl liquid volume 0.6 Gal (2.2 L); sludge space ~0.3 Gal (1.1 L).',
    ],
  },

  /* ======================================================== decanters: NX/UVNX */
  {
    id: 'alfa-laval-nx-314',
    designation: 'NX 314',
    modelType: 'Alfa Laval NX 314 B31-G',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    aliases: ['NX-314'],
    canonicalPath: '/alfa-laval-nx-314-decanter-centrifuge/',
    capacities: [
      { fluid: 'Hemp Ethanol Slurry', kind: 'rated', value: 25, unit: 'US GPM', ruling: 'A6', label: '25 GPM on Hemp Ethanol Slurry' },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3157,
    motorHp: 10,
    bowlDiameter: { value: 14, unit: 'in', alsoMm: 353 },
    bowlLength: { value: 34, unit: 'in', alsoMm: 860 },
    augerDifferentialRpm: AUGER_1_50,
    gearboxRatio: NX_GEARBOX,
    areaEquivalent: 780,
    beachAngle: '8.5 Degrees',
    conveyorProtection: CARBIDE,
    rulings: ['A6', 'A7', 'A8', 'A9', 'A10', 'C4', 'R5-5'],
    notes: [
      'A6: 25 GPM, always stated with the fluid.',
      'A8: 3,157 Gs is exactly what a 353 mm bowl at 4,000 RPM computes to, which is why 3,150 and 3,100 were rejected.',
      'A10: 14" (353 mm) diameter by 34" (860 mm) length. The "34 vs 40 inch" fight was length printed as diameter.',
      'C4: the stainless food-grade decanter photo on four pages is an NX 314.',
      'R5-5 (ruled 2026-08-29): the /wastewater-centrifuge/ comparison table is aligned to the model pages. The NX 314 rated row is 25 GPM stated with its fluid; the 80 GPM claim is removed. The duty rows below it (40 GPM at 5% sludge, 25 GPM at 10% sludge) are fluid-labelled and stay inside A6.',
    ],
    rejectedValues: [
      // A6's ruling is "25 GPM, always stated with the fluid (... or the page's real
      // duty)". A figure printed WITH a real duty is therefore inside the ruling;
      // an unlabelled one is not. That is what `unless` encodes here.
      { text: '40 GPM', reason: 'A6: rejected as an unlabelled NX 314 capacity. Its figure is 25 GPM on hemp ethanol slurry.', unless: DUTY_LABELLED },
      { text: '50 GPM', reason: 'A6: rejected as an unlabelled NX 314 capacity.', unless: DUTY_LABELLED },
      { text: '60 GPM', reason: 'A6: rejected as an unlabelled NX 314 capacity.', unless: DUTY_LABELLED },
      { text: '3,250 RPM', reason: 'A7: rejected. The NX 314 runs at 4,000 RPM.' },
      { text: '15 HP', reason: 'A9/E14: rejected. The NX 314 and UVNX 314 use a 10 HP drive.' },
      { text: '3,150 Gs', reason: 'A8: rejected. The NX 314 develops 3,157 Gs.' },
      { text: '3,100 Gs', reason: 'A8: rejected. The NX 314 develops 3,157 Gs.' },
      { text: '40 inch bowl', reason: 'A10: rejected. 14" diameter, 34" length.' },
      { text: '80 GPM', reason: 'R5-5: rejected as an NX 314 rated capacity. Its rated figure is 25 GPM stated with its fluid.' },
    ],
  },
  {
    id: 'alfa-laval-uvnx-314',
    designation: 'UVNX-314',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    aliases: ['UVNX 314'],
    canonicalPath: '/three-phase-decanter/',
    capacities: [],
    bowlSpeedRpm: 4000,
    gForce: 3157,
    motorHp: 10,
    bowlDiameter: { value: 353, unit: 'mm' },
    bowlLength: { value: 860, unit: 'mm' },
    netWeightLb: 4200,
    separationType: 'Three-phase (tricanter)',
    rulings: ['E14'],
    notes: [
      'E14: UVNX 314 = 10 HP, aligned to the NX 314 model page. The 15 HP figure was rejected.',
      'No capacity is published for the UVNX 314 as a three-phase machine; the NX 314 duty figure is two-phase and does not transfer.',
    ],
    rejectedValues: [
      { text: '15 HP', reason: 'E14: rejected. The UVNX 314 uses a 10 HP drive.' },
    ],
    skipPageAssert: ['capacity'],
  },
  {
    id: 'alfa-laval-nx-414',
    designation: 'NX 414',
    modelType: 'Alfa Laval NX 414 B31-G',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    aliases: ['AVNX 414', 'AVNX-414', 'NX-414'],
    canonicalPath: '/alfa-laval-nx-314-decanter-centrifuge/',
    capacities: [
      { fluid: 'Cannabis THC Solvent Biomass Separation', kind: 'rated', value: 25, unit: 'US GPM', label: '25 GPM on Cannabis THC Solvent Biomass Separation' },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3157,
    augerDifferentialRpm: AUGER_1_50,
    gearboxRatio: NX_GEARBOX,
    conveyorProtection: CARBIDE,
    tbd: true,
    notes: [
      'PARKED: bowl diameter, bowl length, motor HP and AE are NOT published for the AVNX / NX 414. The previous values were cloned from the NX 314 table and were removed. Only what survived the de-clone is recorded here.',
    ],
    skipPageAssert: ['hp'],
  },
  {
    id: 'alfa-laval-nx-416',
    designation: 'NX 416',
    modelType: 'Alfa Laval NX 416 B31-G',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    aliases: ['NX-416'],
    canonicalPath: '/alfa-laval-nx-314-decanter-centrifuge/',
    capacities: [
      { fluid: 'Used cooking oil (UCO)', kind: 'rated', value: 40, unit: 'US GPM', conditions: 'at 180 °F', label: '40 GPM on UCO @ 180 F' },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3157,
    motorHp: 15,
    bowlDiameter: { value: 14, unit: 'in', alsoMm: 353 },
    bowlLength: { value: 46, unit: 'in', alsoMm: 1160 },
    augerDifferentialRpm: AUGER_1_50,
    gearboxRatio: NX_GEARBOX,
    areaEquivalent: 1170,
    beachAngle: '8.5 Degrees',
    conveyorProtection: CARBIDE,
    tbd: true,
    rulings: ['R5-3'],
    notes: [
      'R5-3 (ruled 2026-08-29): the NX 416 drive is 15 HP, confirmed. The page table was right and the 20 HP prose figure was the error. 20 HP remains CORRECT for the NX 418, so the rejection below is scoped to this record only.',
      'STILL PARKED: the 14" (353 mm) bowl diameter may itself be cloned from the NX 314 and is flagged for a future ruling.',
    ],
    rejectedValues: [
      { text: '20 HP', reason: 'R5-3: rejected for the NX 416. Its drive is 15 HP. (20 HP is correct for the NX 418 and is not rejected there.)' },
    ],
  },
  {
    id: 'alfa-laval-nx-418',
    designation: 'NX 418',
    modelType: 'Alfa Laval NX 418 B31-G Decanter Centrifuge',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    aliases: ['NX-418'],
    canonicalPath: '/alfa-laval-nx-418-decanter-centrifuge/',
    capacities: [
      { fluid: 'Water Sludge Thickening', kind: 'rated', value: 110, unit: 'US GPM', label: '110 GPM on Water Sludge Thickening' },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3740,
    motorHp: 20,
    bowlDiameter: { value: 418, unit: 'mm' },
    bowlLength: { value: 58, unit: 'in' },
    augerDifferentialRpm: AUGER_1_50,
    gearboxRatio: '1 : 159 (2.5 kN-M)',
    areaEquivalent: 1565,
    conveyorProtection: CARBIDE,
    rulings: ['A11', 'E12', 'E13', 'R5-5'],
    notes: [
      'A11: 58" bowl length. The three-phase comparison table on /three-phase-decanter/ states the same dimension as 1,460 mm.',
      'E12: 20 HP. The 25 HP prose figure was rejected against the page table two lines below it.',
      'E13: 3,740 Gs, recomputed for the 418 mm bowl at 4,000 RPM. The 3,150 Gs figure was copy-pasted from the NX 314.',
      'D6: the duplicate BreadcrumbList on this page was deduped.',
      'R5-5 (ruled 2026-08-29): the NX 418 rated capacity is 110 GPM on water sludge thickening everywhere it is published. The 170 GPM claim on /wastewater-centrifuge/ and its siblings is removed.',
    ],
    rejectedValues: [
      { text: '25 HP', reason: 'E12: rejected. The NX 418 uses a 20 HP drive.' },
      { text: '170 GPM', reason: 'R5-5: rejected. The NX 418 rated capacity is 110 GPM on water sludge thickening.' },
      { text: '3,150 Gs', reason: 'E13: rejected. A 418 mm bowl at 4,000 RPM develops 3,740 Gs.' },
      { text: '3,150 RCF', reason: 'E13: rejected. A 418 mm bowl at 4,000 RPM develops 3,740 Gs.' },
      { text: '68"', reason: 'A11: rejected. The NX 418 bowl length is 58".' },
    ],
  },
  {
    id: 'alfa-laval-uvnx-418',
    designation: 'UVNX 418',
    modelType: 'Alfa Laval UVNX 418 B11-G',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    aliases: ['UVNX-418'],
    canonicalPath: '/alfa-laval-nx-418-decanter-centrifuge/',
    capacities: [
      { fluid: 'Fish Stickwater & Fishmeal Separation', kind: 'rated', value: 70, unit: 'US GPM', label: '70 GPM on Fish Stickwater & Fishmeal Separation' },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3740,
    motorHp: 20,
    bowlDiameter: { value: 418, unit: 'mm' },
    bowlLength: { value: 1460, unit: 'mm' },
    netWeightLb: 5500,
    augerDifferentialRpm: AUGER_1_50,
    gearboxRatio: '1 : 159 (2.5 kN-M)',
    conveyorProtection: CARBIDE,
    separationType: 'Three-phase (tricanter)',
    rulings: ['E12', 'E13', 'E14'],
    notes: ['E12/E14: 20 HP. E13: 3,740 Gs.'],
    rejectedValues: [
      { text: '25 HP', reason: 'E12/E14: rejected. The UVNX 418 uses a 20 HP drive.' },
      { text: '3,150 Gs', reason: 'E13: rejected. A 418 mm bowl at 4,000 RPM develops 3,740 Gs.' },
    ],
  },
  {
    id: 'alfa-laval-chnx-418',
    designation: 'CHNX 418',
    modelType: 'Alfa Laval CHNX 418 B31-G Decanter Centrifuge',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    aliases: ['CHNX-418'],
    canonicalPath: '/alfa-laval-chnx-418-decanter/',
    capacities: [
      {
        fluid: 'Process duty (band; depends on duty)',
        kind: 'rated',
        value: [5, 20],
        unit: 'm3/hr',
        derivedGpm: [22, 88],
        ruling: 'E21',
        label: '5-20 m3/hr (22-88 GPM) depending on duty',
      },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3740,
    motorHp: 20,
    bowlDiameter: { value: 418, unit: 'mm' },
    augerDifferentialRpm: AUGER_1_50,
    gearboxRatio: '1 : 159 (2.5 kN-M)',
    areaEquivalent: 1565,
    conveyorProtection: CARBIDE,
    rulings: ['E21', 'E13', 'F1', 'F2', 'F3'],
    notes: [
      'E21: 5-20 m3/hr (22-88 GPM depending on duty). All 100 GPM claims were removed.',
      'CORRECTED 2026-08-29: the page carried 3,150 RCF, cloned from the NX 314. The CHNX 418 shares the NX 418 bowl (418 mm at 4,000 RPM), so E13 applies to it identically: 3,740 Gs.',
      'F1/F3: built on an Alfa Laval CHNX 418 originally manufactured for ATEX service. Dolphin remanufactures it and verifies nitrogen purge function in Warren MI. Dolphin holds NO original certification documents, so no documentation promise is made.',
      'F2: the hazardous-area row reads "ATEX (original Alfa Laval build)" with no TBD marker.',
    ],
    rejectedValues: [
      { text: '100 GPM', reason: 'E21: rejected. The CHNX 418 band is 5-20 m3/hr (22-88 GPM).' },
      { text: '3,150 RCF', reason: 'E13: rejected. The 418 mm bowl at 4,000 RPM develops 3,740 Gs.' },
    ],
    skipPageAssert: ['capacity'],
  },
  {
    id: 'alfa-laval-g2-40',
    designation: 'G2-40',
    modelType: 'Alfa Laval G2-40 Decanter Centrifuge',
    manufacturer: 'Alfa Laval',
    family: 'decanter',
    canonicalPath: '/alfa-laval-g2-40-decanter/',
    capacities: [
      { fluid: 'Water Sludge Thickening', kind: 'rated', value: 160, unit: 'US GPM', label: '160 GPM on Water Sludge Thickening' },
    ],
    bowlSpeedRpm: 4000,
    motorHp: 20,
    augerDifferentialRpm: '1 ~ 140 RPM',
    gearboxRatio: '1: 52 (3.5 kN-M) DD Gearbox',
    conveyorProtection: CARBIDE,
    tbd: true,
    rulings: ['R5-7'],
    notes: [
      'R5-7 (ruled 2026-08-29): the 3,150 RCF G-force and the AE 1,565 figures were cloned from the pre-correction NX 418 and are REMOVED from the page. No replacement was invented.',
      'TBD: G-force is not published for the G2-40. Awaiting a sourced figure.',
      'TBD: area equivalent (AE) is not published for the G2-40. Awaiting a sourced figure.',
    ],
    rejectedValues: [
      { text: '3,150 RCF', reason: 'R5-7: rejected. The G2-40 G-force was cloned from the pre-correction NX 418 and is not published.' },
      { text: '3,150 G', reason: 'R5-7: rejected. The G2-40 G-force was cloned from the pre-correction NX 418 and is not published.' },
      { text: '1,565', reason: 'R5-7: rejected. The G2-40 AE was cloned from the pre-correction NX 418 and is not published.' },
    ],
  },

  /* ==================================================== decanters: Sharples */
  {
    id: 'sharples-p-3000',
    designation: 'P-3000',
    modelType: 'Sharples P-3000',
    manufacturer: 'Sharples (Alfa Laval)',
    family: 'decanter',
    aliases: ['Sharples P-3000', 'P3000'],
    canonicalPath: '/sharples-p-3000-decanter/',
    capacities: [
      { fluid: 'Municipal Sludge Thickening', kind: 'rated', value: 25, unit: 'US GPM', label: '25 GPM on Municipal Sludge Thickening' },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3150,
    motorHp: 15,
    augerDifferentialRpm: '1 ~ 40 RPM',
    gearboxRatio: '1: 125',
    areaEquivalent: 850,
    conveyorProtection: CARBIDE,
  },
  {
    id: 'sharples-p-3400',
    designation: 'P-3400',
    modelType: 'Sharples P-3400',
    manufacturer: 'Sharples / Pennwalt (Alfa Laval)',
    family: 'decanter',
    aliases: ['Sharples P-3400', 'P3400'],
    canonicalPath: '/sharples-p-3400-decanter/',
    capacities: [
      { fluid: 'Ethanol Biomass Separation', kind: 'rated', value: 50, unit: 'US GPM', label: '50 GPM on Ethanol Biomass Separation' },
    ],
    bowlSpeedRpm: 4000,
    gForce: 3150,
    motorHp: 25,
    augerDifferentialRpm: '1 ~ 42 RPM',
    gearboxRatio: '1: 95',
    areaEquivalent: 1500,
    conveyorProtection: CARBIDE,
    rulings: ['B6'],
    notes: [
      'B6: the brand stays "Alfa Laval (Sharples)". Alfa Laval owns the Sharples decanter line.',
      'The OEM dimension table on the same page lists a 40 HP maximum power for the P-3400 / PM 30000 frame. That is the frame ceiling, not the installed drive; the installed drive is 25 HP.',
    ],
  },
  {
    id: 'sharples-p-660',
    designation: 'P-660',
    modelType: 'Sharples P-660',
    manufacturer: 'Sharples (Alfa Laval)',
    family: 'decanter',
    aliases: ['Sharples P-660', 'P660'],
    canonicalPath: '/smallest-industrial-centrifuges/',
    capacities: [
      {
        fluid: 'Low-solids liquid',
        kind: 'rated',
        value: [1, 5],
        unit: 'US GPM',
        note: 'Published as an application range, not a single duty point.',
      },
    ],
    bowlSpeedRpm: 6000,
    gForce: 3050,
    motorHp: 5,
    bowlDiameter: { value: 6, unit: 'in' },
    netWeightLb: 450,
    dimensions: '15" H x 40" L x 30" D',
    rulings: ['E15', 'R5-2'],
    notes: [
      'E15: the P-660 motor is 5 HP, aligned across all three variants. The 7.5 HP and "5-10 HP" figures were rejected.',
      'R5-2 (ruled 2026-08-29): the Sharples P-660 develops 3,050 Gs. The 3,070 Gs prose on /smallest-industrial-centrifuges/ was the error and was corrected to match the table.',
    ],
    rejectedValues: [
      { text: '7.5 HP', reason: 'E15: rejected. The P-660 uses a 5 HP motor.' },
      { text: '3,070 Gs', reason: 'R5-2: rejected. The Sharples P-660 develops 3,050 Gs.' },
    ],
    skipPageAssert: ['capacity'],
  },

  /* ================================================= Dolphin module classes */
  {
    id: 'dolphin-dmpx-014',
    designation: 'DMPX-014',
    manufacturer: 'Dolphin Centrifuge',
    family: 'disc-stack',
    dolphinModule: 'DMPX-014',
    canonicalPath: '/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/',
    capacities: [
      {
        fluid: 'Waste vegetable oil (WVO)',
        kind: 'rated',
        value: 15,
        unit: 'US GPM',
        ruling: 'A18',
        note: 'A18: the DMPX-014 owns the 15 GPM WVO rail figure, not the DMPX-028.',
      },
    ],
    motorHp: 5,
    sludgeVolumeGal: [0.32, 0.34],
    voltages: '230 / 460 V, 3-Phase, 60 Hz',
    separationType: 'Three-phase light liquid / heavy liquid / solids',
    rulings: ['A18', 'C1', 'C7'],
    notes: [
      'Base machines: Alfa Laval MOPX 205 or WHPX 405 (remanufactured).',
      'C1: both units on the duplex skid are WHPX 405s.',
      'C7: the quench-oil skid IS the DMPX-014 (WHPX 405). The 28 GPM quench figure belongs to the DMPX-028 / MOPX 207.',
    ],
    skipPageAssert: ['capacity', 'rpm', 'hp'],
  },
  {
    id: 'dolphin-dmpx-028',
    designation: 'DMPX-028',
    manufacturer: 'Dolphin Centrifuge',
    family: 'disc-stack',
    dolphinModule: 'DMPX-028',
    canonicalPath: '/centrifuges/dmpx-028/',
    capacities: [
      { fluid: 'Quench oil', kind: 'rated', value: 28, unit: 'US GPM', ruling: 'A17' },
      { fluid: 'Water-based machining coolant', kind: 'rated', value: 28, unit: 'US GPM', ruling: 'E10' },
    ],
    motorHp: [7.5, 10],
    sludgeVolumeGal: 1.03,
    voltages: V_230_460_3PH,
    separationType: 'Three-phase (oil / water / solids)',
    rulings: ['A17', 'A18', 'E10', 'B5'],
    notes: [
      'Base machines: Alfa Laval MOPX 207 (primary) or WHPX 407.',
      'A17: 28 GPM, always with its fluid label.',
      'A18: the 15 GPM WVO rail figure is the DMPX-014, not this module.',
    ],
    rejectedValues: [
      { text: '20 GPM', reason: 'A17: rejected as the unlabelled DMPX-028 figure. Publish 28 GPM with its fluid.' },
    ],
    skipPageAssert: ['capacity', 'rpm', 'hp'],
  },
  {
    id: 'dolphin-dmpx-042',
    designation: 'DMPX-042',
    manufacturer: 'Dolphin Centrifuge',
    family: 'disc-stack',
    dolphinModule: 'DMPX-042',
    canonicalPath: '/centrifuges/dmpx-042/',
    capacities: [],
    bowlSpeedRpm: [5180, 7125],
    gForce: '7,000-8,000',
    motorHp: [10, 15],
    sludgeVolumeGal: [1.64, 1.66],
    voltages: V_230_460_3PH,
    separationType: 'Three-phase (oil / water / solids)',
    rulings: ['A14', 'A15', 'B2', 'B4'],
    notes: [
      'Base machines: Alfa Laval MOPX 209, MOPX 210, WHPX 409 or WHPX 510 (remanufactured).',
      'A14 ruled 69 GPM rated. The 2026-08-28 pass replaced the single class-wide figure with each base machine\'s own OEM record, because a commercial class has no one flow rating. The per-machine records are canonical; 69 GPM is not published.',
      'A15: 1.64 gal sludge volume. The module page publishes the variant-dependent band 1.64-1.66 gal.',
      'B2: DMSC-042 is retired. Say "DMPX-042 acid-service configuration".',
    ],
    rejectedValues: [
      { text: '68 GPM', reason: 'A14: rejected.' },
      { text: '1.6 gal', reason: 'A15: the DMPX-042 sludge volume is 1.64 gal.' },
      { text: '1.55 gal', reason: 'A15: 1.55 gal is the MOPX 310 figure, not the DMPX-042.' },
    ],
    skipPageAssert: ['capacity'],
  },
  {
    id: 'dolphin-dmpx-070',
    designation: 'DMPX-070',
    manufacturer: 'Dolphin Centrifuge',
    family: 'disc-stack',
    dolphinModule: 'DMPX-070',
    canonicalPath: '/centrifuges/dmpx-070/',
    capacities: [
      {
        fluid: 'Diesel',
        kind: 'actual',
        value: 72,
        unit: 'US GPM',
        ruling: 'A16',
        note: 'Actual throughput on diesel, labelled as such.',
      },
      {
        fluid: 'Fluid not specified (OEM rated band)',
        kind: 'rated',
        value: [95, 108],
        unit: 'US GPM',
        ruling: 'A16',
        note: 'Rated band, labelled as such. Never present it as a diesel capacity.',
      },
    ],
    bowlSpeedRpm: [4100, 4150],
    motorHp: 15,
    sludgeVolumeGal: [3.65, 3.96],
    voltages: V_230_460_3PH,
    separationType: 'Three-phase (oil / water / solids)',
    rulings: ['A16', 'E16', 'R5-8'],
    notes: [
      'Base machines: Alfa Laval MOPX 213 or WHPX 513 (remanufactured).',
      'A16: 72 GPM actual on diesel and 95-108 GPM rated, both labelled.',
      'gForce: INTENTIONALLY UNPUBLISHED. Owner ruling 2026-08-29: not published. R5-8 closes A16\'s parked G-force item - the DMPX-070 G-force is officially not published, not merely pending, so the field is absent by decision and the placeholder row and TBD comment on /centrifuges/dmpx-070/ were removed.',
      'E16: this module at 72 GPM diesel is the site top capacity for black diesel. The 80 GPM headline was removed.',
    ],
    rejectedValues: [
      { text: '80 GPM', reason: 'E16: rejected. No machine on the site is rated 80 GPM on black diesel; the ceiling is 72 GPM on the DMPX-070.' },
      { text: '7,000+', reason: 'R5-8: rejected. No G-force is published for the DMPX-070.' },
    ],
    skipPageAssert: ['capacity'],
  },
  {
    id: 'dolphin-dmb-004',
    designation: 'DMB-004',
    manufacturer: 'Dolphin Centrifuge',
    family: 'disc-stack',
    dolphinModule: 'DMB-004',
    canonicalPath: '/centrifuges/dmb-004/',
    capacities: [
      { fluid: 'Diesel fuel', kind: 'rated', value: 4, unit: 'US GPM', ruling: 'A12' },
    ],
    motorHp: 1,
    rulings: ['A12'],
    notes: [
      'Base machine: Alfa Laval MAB 103 (remanufactured).',
      'A12: 4 GPM on diesel, module and bare machine both labelled 4. The bare machine page additionally publishes the OEM record 900 L/h (3.96 US GPM derived), which is the same number precisely.',
    ],
    skipPageAssert: ['capacity', 'rpm', 'hp'],
  },
  {
    id: 'dolphin-dmb-007',
    designation: 'DMB-007',
    manufacturer: 'Dolphin Centrifuge',
    family: 'disc-stack',
    dolphinModule: 'DMB-007',
    canonicalPath: '/centrifuges/dmb-007/',
    capacities: [],
    motorHp: 2,
    rulings: ['B10', 'E16'],
    notes: [
      'Base machine: Alfa Laval MAB 104 (remanufactured). B10 settled this against a digest claim that DMB-007 was the MAB 103.',
      'E16: the DMB-007 at 2 GPM is the smallest black-diesel system Dolphin offers.',
    ],
    skipPageAssert: ['capacity', 'rpm', 'hp'],
  },
];

/* ------------------------------------------------------------- accessors */

const byId = new Map(models.map((model) => [model.id, model]));

export function getModel(id: string): ModelSpec {
  const model = byId.get(id);
  if (!model) throw new Error(`centrifugeSpecs: unknown model id "${id}"`);
  return model;
}

export const SPEC_SOURCE_VERSION = 'dolphin-centrifuge-specs-v1';
export const SPEC_SOURCE_REVIEWED = '2026-08-29';

export const disclaimer =
  'Dolphin Centrifuge is an independent remanufacturer of Alfa Laval centrifuges and is not affiliated with or authorized by Alfa Laval. Alfa Laval model designations identify the base machines Dolphin remanufactures. Every capacity below is published with the fluid or duty it belongs to; never transfer a capacity between fluids or between base machines.';

export default models;
