import { technicalCatalog as oemCatalog, US_GPM_DIVISOR } from './centrifugeTechnicalRegistry.mjs';
import { models as publishedModels, SPEC_SOURCE_REVIEWED } from './centrifugeSpecs.ts';
import { configurationSources, machineConfigurations } from './machineConfigurations.mjs';

const SITE = 'https://dolphincentrifuge.com';
const publishedById = new Map(publishedModels.map(model => [model.id, model]));
const oemById = new Map(oemCatalog.models.map(model => [model.id, model]));
const value = (number, unit) => Array.isArray(number)
  ? {minimum: number[0], maximum: number[1], unit} : {value: number, unit};

function specifications(model, legacy = {}) {
  if (!model) return {...legacy, ...(legacy.motorPower ? {motorPower: {...legacy.motorPower,
    scope: 'published centrifuge drive; exact installed configuration unresolved', totalSystemPower: false,
    qualification: 'Do not infer a pump rating or total system load from this commercial range.'}} : {})};
  const source = {
    evidenceClass: 'first-party-owner-attestation',
    sourceUrl: `${SITE}${model.canonicalPath ?? '/technical-data/'}`,
    authoritativeRecord: `${SITE}/specs.json`,
    reviewedOn: SPEC_SOURCE_REVIEWED,
  };
  const specs = {...legacy};
  // Mechanical values come from the same source used by the public spec tables.
  for (const [key, field, unit] of [
    ['motorPower', 'motorHp', 'HP'], ['bowlSpeed', 'bowlSpeedRpm', 'RPM'],
    ['sludgeSpace', 'sludgeVolumeGal', 'US gal'], ['netWeight', 'netWeightLb', 'lb'],
  ]) {
    delete specs[key];
    if (model[field] !== undefined) specs[key] = {...value(model[field], unit), ...source};
  }
  if (specs.motorPower) {
    Object.assign(specs.motorPower, {
      scope: model.id.startsWith('dolphin-') ? 'published module centrifuge drive' : 'published base-machine centrifuge drive',
      configuration: model.modelType ?? model.designation,
      feedPumpIncluded: 'not established by the published motor rating',
      totalSystemPower: false,
      qualification: 'Drive rating only. Pump-equipped and pump-free variants require an explicit nameplate/configuration match; auxiliary motors and heaters are separate.',
      ...(model.motorNote ? {note: model.motorNote} : {}),
    });
  }
  const configurations = machineConfigurations(model.id);
  if (configurations.length) {
    specs.motorPower = {
      status: 'requires_configuration', configurationIds: configurations.map(c => c.id),
      publishedNominalDrive: {value: model.motorHp, unit: 'HP', sourceUrl: source.sourceUrl,
        qualification: 'Nominal Dolphin drive rating; OEM pump arrangement not identified by this number.'},
      qualification: 'No universal motor power for this model. Select configurationId; published nominal HP does not identify the OEM pump arrangement.',
      sourceUrl: configurationSources[model.id].sourceUrl,
    };
    for (const config of configurations) specs[config.id] = config;
  }
  if (specs.bowlSpeed) Object.assign(specs.bowlSpeed, {
    scope: 'published model configuration; match frequency and gearing before applying to an installed machine',
    ...(configurationSources[model.id]?.bowlSpeedByFrequency ? {
      frequencyHz: 60, sourceUrl: configurationSources[model.id].sourceUrl,
      reviewedOn: '2026-09-13', evidenceClass: 'public-oem-manual',
      alternatives: configurationSources[model.id].bowlSpeedByFrequency,
    } : {}),
  });
  if (specs.netWeight) specs.netWeight.scope = 'published machine weight; not a complete skid or shipping weight';
  for (const [key, field] of [
    ['cleaningMethod', 'bowlType'], ['separationType', 'separationType'],
    ['voltage', 'voltages'], ['wettedParts', 'wettedParts'], ['dimensions', 'dimensions'],
    ['capacityPolicy', 'capacityPolicy'],
  ]) if (model[field] !== undefined) specs[key] = {value: model[field], ...source};
  if (model.gForce !== undefined) specs.gForce = {...value(model.gForce, 'Gs'), ...source};
  if (model.id === 'alfa-laval-mopx-209') specs.auxiliaryPumpMotor = {
    minimum: 1, maximum: 3, unit: 'HP', scope: 'additional pump motor in a typical DMPX-042 package',
    configurationSpecific: true, addedToDriveRating: false,
    ...source,
    qualification: 'Published typical range, not the installed pump rating for a particular skid. Select the actual package before stating total connected load.',
  };
  return specs;
}

function publishedCapacity(model, capacity, index) {
  const factor = capacity.unit === 'L/h' ? 1 : capacity.unit === 'm3/hr' ? 1000 : US_GPM_DIVISOR;
  const liters = Array.isArray(capacity.value) ? capacity.value.map(n => n * factor) : capacity.value * factor;
  const gpm = Array.isArray(liters) ? liters.map(n => Number((n / US_GPM_DIVISOR).toFixed(2))) : Number((liters / US_GPM_DIVISOR).toFixed(2));
  return {
    id: `${model.id}-published-${index}`,
    fluid: {name: capacity.fluid, category: 'published-application', searchTerms: []},
    ratingBasis: capacity.kind === 'reference' ? 'oem-rated-reference' : `dolphin-${capacity.kind}`,
    sourceValue: {...value(capacity.value, capacity.unit), valueStatus: 'first-party-published-value'},
    derivedConversions: [{...value(gpm, 'US GPM'), derived: capacity.unit !== 'US GPM'}],
    conditions: {sourceLabel: capacity.conditions ?? 'Operating conditions not fully published.',
      ...(capacity.note ? {note: capacity.note} : {})},
    answerability: {canStateAsFact: true, qualificationRequired: true, requiredQualifiers: ['exact configuration', 'fluid', 'rating basis', 'published conditions']},
    source: {sourceDocumentId: 'dolphin-published-specifications', sourceDocumentTitle: 'Dolphin published machine specifications',
      location: `${model.id}/capacities/${index}`, sourceUrl: `${SITE}${capacity.assertOnPath ?? model.canonicalPath ?? '/technical-data/'}`,
      reviewedOn: SPEC_SOURCE_REVIEWED, evidenceClass: 'first-party-owner-attestation'},
  };
}

const ids = [...new Set([...oemById.keys(), ...publishedById.keys()])];
const models = ids.map(id => {
  const oem = oemById.get(id);
  const published = publishedById.get(id);
  const commercial = id.startsWith('dolphin-');
  const record = oem ?? {
    id, displayName: `${published.manufacturer} ${published.designation}`,
    manufacturer: published.manufacturer,
    recordType: commercial ? 'dolphin-commercial-class' : 'oem-base-machine',
    aliases: [published.designation, ...(published.aliases ?? []), ...(published.modelType ? [published.modelType] : [])],
    canonicalPage: `${SITE}${published.canonicalPath ?? '/technical-data/'}`,
    machineReadableRecord: `${SITE}/technical-data/${id}.json`,
    capacities: commercial ? [] : published.capacities.map((capacity, index) => publishedCapacity(published, capacity, index)),
  };
  return {...record,
    aliases: [...new Set([...(record.aliases ?? []), ...(published?.aliases ?? []), ...(published?.modelType ? [published.modelType] : [])])],
    ...(published ? {family: published.family, publishedSpecificationRecord: `${SITE}/specs.json`,
      unpublishedFields: published.tbd ? published.notes : [],
      // A module is never a unique installed machine configuration.
      configurationStatus: commercial ? 'select-exact-base-machine-and-package' : 'published-model-configuration'} : {}),
    specifications: specifications(published, oem?.specifications),
    configurations: machineConfigurations(id),
  };
});

export const technicalCatalog = {
  ...oemCatalog,
  mechanicalSpecificationsReviewed: SPEC_SOURCE_REVIEWED,
  configurationReview: {date: '2026-09-13', scope: 'MAB 104 and MAB 206 OEM pump variants; not a full serial-number inventory'},
  methodology: {...oemCatalog.methodology,
    capacitySourceOfTruth: 'OEM table rows retain original L/h; additional Dolphin specifications retain their original published units and separate rating basis.',
  },
  sourceDocuments: [...oemCatalog.sourceDocuments,
    {id: 'dolphin-published-specifications', sourceUrl: `${SITE}/specs.json`, reviewedOn: SPEC_SOURCE_REVIEWED, evidenceClass: 'first-party-owner-attestation'},
    ...Object.entries(configurationSources).map(([id, source]) => ({id: `${id}-oem-configuration-manual`, ...source})),
  ],
  agentInterface: {...oemCatalog.agentInterface,
    webMcp: {...oemCatalog.agentInterface.webMcp,
      tools: [...oemCatalog.agentInterface.webMcp.tools, 'select_centrifuge_candidates']}},
  statistics: {...oemCatalog.statistics, modelRecords: models.length,
    capacityRecords: models.reduce((sum, model) => sum + model.capacities.length, 0)},
  models,
};
export default technicalCatalog;
