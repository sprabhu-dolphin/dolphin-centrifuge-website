import { getCentrifugeCapacity } from './agentCatalogQuery.mjs';

const LPH_PER_US_GPM = 227.124707;

/** Deterministic engineering shortlist, shared by WebMCP and future answer UIs. */
export function selectCentrifugeCandidates(catalog, input) {
  if (!input || typeof input.application !== 'string' || !input.application.trim() ||
      input.application.length > 200 || !Number.isFinite(input.requiredFlow) || input.requiredFlow <= 0 ||
      !['US GPM', 'L/h'].includes(input.flowUnit) ||
      (input.cleaning && !['any', 'manual', 'self-cleaning'].includes(input.cleaning)) ||
      (input.temperatureC !== undefined && !Number.isFinite(input.temperatureC)) ||
      (input.viscosityCst !== undefined && (!Number.isFinite(input.viscosityCst) || input.viscosityCst <= 0)) ||
      (input.viscosityReferenceTemperatureC !== undefined && !Number.isFinite(input.viscosityReferenceTemperatureC)) ||
      (input.offset !== undefined && (!Number.isSafeInteger(input.offset) || input.offset < 0))) {
    return {status: 'invalid_input', message: 'Supply an application, positive requiredFlow, and explicit flowUnit (US GPM or L/h).'};
  }
  const requiredLph = input.requiredFlow * (input.flowUnit === 'US GPM' ? LPH_PER_US_GPM : 1);
  const candidates = [];
  for (const model of catalog.models) {
    if (model.recordType !== 'oem-base-machine') continue;
    const cleaningText = model.specifications?.cleaningMethod?.value ?? '';
    const cleaning = /manual|solid.retaining/i.test(cleaningText) ? 'manual'
      : /self.clean|automatic|partial.discharge|total.discharge/i.test(cleaningText) ? 'self-cleaning' : 'unpublished';
    if (input.cleaning && input.cleaning !== 'any' && input.cleaning !== cleaning) continue;
    const result = getCentrifugeCapacity(catalog, {model: model.id, fluid: input.application});
    if (result.status !== 'ok') continue;
    for (const capacity of result.data.capacities) {
      // References, maximum ceilings and one-off actual runs cannot establish a
      // general application selection. OEM application tables provide this lane.
      if (capacity.ratingBasis !== 'oem-application') continue;
      const conditions = capacity.conditions;
      const temperature = conditions.centrifugationTemperatureC ?? conditions.fluidTemperatureC;
      const temperatureMatches = typeof temperature === 'number' ? temperature === input.temperatureC
        : temperature && input.temperatureC >= temperature.minimum && input.temperatureC <= temperature.maximum;
      if (input.temperatureC !== undefined && !temperatureMatches) continue;
      if (input.viscosityCst !== undefined && conditions.viscosity?.value !== input.viscosityCst) continue;
      if (input.viscosityReferenceTemperatureC !== undefined && conditions.viscosity?.referenceTemperatureC !== input.viscosityReferenceTemperatureC) continue;
      const source = capacity.sourceValue;
      if (source.unit !== 'L/h') continue;
      const conservativeLph = source.value ?? source.minimum;
      if (!Number.isFinite(conservativeLph) || conservativeLph < requiredLph) continue;
      candidates.push({model, cleaning, capacity, conservativeLph});
    }
  }
  candidates.sort((a, b) => a.conservativeLph - b.conservativeLph || a.model.id.localeCompare(b.model.id) || a.capacity.id.localeCompare(b.capacity.id));
  const unique = candidates.filter((candidate, i) => candidates.findIndex(other => other.model.id === candidate.model.id) === i);
  const offset = input.offset ?? 0;
  const selected = unique[offset];
  if (!selected) return {
    status: offset > 0 ? 'invalid_input' : 'no_documented_match',
    canRecommendPurchase: false,
    message: offset > 0 ? 'Offset is outside the results. Retry with offset 0.' : 'No OEM application-table match at the supplied flow and conditions. This is a data limit, not proof that Dolphin has no suitable equipment.',
    inquiryUrl: 'https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/',
  };
  const {model, capacity, cleaning} = selected;
  const missing = ['solids loading', 'water content and emulsion state', 'required outlet quality', 'duty cycle', 'installed pump and electrical configuration'];
  if (input.temperatureC === undefined) missing.unshift('operating temperature');
  if (input.viscosityCst === undefined) missing.unshift('viscosity');
  if (input.viscosityReferenceTemperatureC === undefined) missing.unshift('viscosity reference temperature');
  if (!input.cleaning || input.cleaning === 'any') missing.push('manual versus automatic solids discharge preference');
  return {
    status: 'candidate', canRecommendPurchase: false,
    ranking: 'Smallest documented OEM application capacity meeting the requested flow; not a universal best-machine ranking.',
    candidate: {
      modelId: model.id, cleaning,
      capacity: {...capacity.sourceValue, usGpm: capacity.derivedConversions[0].value ?? capacity.derivedConversions[0].minimum},
      conditions: capacity.conditions,
      moduleIds: catalog.models.filter(m => m.baseMachineVariantIds?.includes(model.id)).map(m => m.id),
      driveHp: model.specifications.motorPower?.value ?? null,
      powerScope: 'Published centrifuge drive only; installed pump variant and total system load require configuration evidence.',
      sourceUrl: model.machineReadableRecord,
      sourceLocation: capacity.source.location,
    },
    missingInputs: missing,
    page: {offset, total: unique.length, nextOffset: offset + 1 < unique.length ? offset + 1 : null},
  };
}
