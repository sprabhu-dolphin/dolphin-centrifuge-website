// Keep browser tool results small; the public JSON remains the complete record.
const CATALOG_URL = 'https://dolphincentrifuge.com/technical-data/centrifuges.v1.json';

function modelLink(model) {
  return model && { id: model.id, url: model.machineReadableRecord };
}

export function compactToolResult(result, input = {}) {
  if (!result.data) return result;
  const original = result.data;
  const data = { ...original };
  for (const key of ['requestedModel', 'selectedModel']) {
    if (data[key]) data[key] = modelLink(data[key]);
  }
  for (const key of ['baseMachineVariants', 'matches', 'allowedBaseMachineVariants']) {
    if (Array.isArray(data[key])) data[key] = data[key].map(modelLink);
  }
  let listKey;
  if (Array.isArray(data.models)) {
    listKey = 'models';
    data.models = data.models.map(model => ({
      id: model.id, name: model.displayName, recordType: model.recordType,
      ...(model.baseMachineVariantIds ? { baseMachineVariantIds: model.baseMachineVariantIds } : {}),
    }));
  } else if (Array.isArray(data.capacities)) {
    listKey = 'capacities';
    data.capacities = data.capacities.map(capacity => ({
      id: capacity.id,
      fluid: capacity.fluid.name,
      conditions: capacity.conditions,
      ratingBasis: capacity.ratingBasis,
      sourceValue: capacity.sourceValue,
      derivedConversions: capacity.derivedConversions,
      source: {
        document: capacity.source.sourceDocumentId,
        location: capacity.source.location,
        reviewedOn: capacity.source.reviewedOn,
      },
    }));
  } else if (data.specifications && result.status === 'ok') {
    listKey = 'specifications';
    // Each property retains its full units, scope, source, and qualifications.
    data.specifications = Object.entries(data.specifications).flatMap(([field, value]) =>
      ['commercialClass', 'baseMachine'].includes(field)
        ? Object.entries(value).map(([name, fact]) => ({ field: `${field}.${name}`, fact }))
        : [{ field, fact: value }],
    );
  }
  const response = {
    status: result.status,
    answerability: result.answerability,
    warnings: result.warnings,
    data,
    sourceUrl: original.selectedModel?.machineReadableRecord ??
      original.requestedModel?.machineReadableRecord ?? CATALOG_URL,
  };
  if (listKey && data[listKey].length) {
    const all = data[listKey];
    const offset = input.offset ?? 0;
    const limit = listKey === 'models' ? 3 : 1;
    data[listKey] = all.slice(offset, offset + limit);
    response.page = {
      offset, total: all.length,
      nextOffset: offset + data[listKey].length < all.length
        ? offset + data[listKey].length : null,
    };
    if (offset >= all.length) {
      response.status = 'invalid_input';
      response.answerability = { canStateAsFact: false, qualificationRequired: false, missingInputs: [] };
      response.warnings = ['Offset is outside the results. Retry with offset 0.'];
    }
  }
  return response;
}
