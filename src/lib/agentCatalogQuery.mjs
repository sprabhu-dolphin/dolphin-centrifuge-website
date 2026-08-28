/**
 * Pure query helpers for Dolphin's public centrifuge catalog.
 *
 * These helpers deliberately do not infer a capacity across OEM platforms. A
 * Dolphin commercial class that names more than one base-machine variant must
 * be narrowed to an exact variant before any numeric capacity is returned.
 */

const DEFAULT_SCHEMA_VERSION = 'dolphin-centrifuge-technical-v1';

/** @param {unknown} value */
function normalize(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u2122\u00ae\u00a9]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** @param {unknown} value */
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/** @param {Record<string, unknown>} catalog */
function schemaVersion(catalog) {
  return typeof catalog?.schemaVersion === 'string'
    ? catalog.schemaVersion
    : DEFAULT_SCHEMA_VERSION;
}

/** @param {Record<string, unknown>} model */
function modelTerms(model) {
  return [model.id, model.displayName, model.manufacturer, ...asArray(model.aliases)]
    .map(normalize)
    .filter(Boolean);
}

/** @param {Record<string, unknown>} model */
function modelSummary(model) {
  const summary = {
    id: model.id,
    displayName: model.displayName,
    manufacturer: model.manufacturer,
    recordType: model.recordType,
    aliases: asArray(model.aliases),
    canonicalPage: model.canonicalPage,
    machineReadableRecord: model.machineReadableRecord,
  };

  const baseMachineVariantIds = asArray(model.baseMachineVariantIds);
  return baseMachineVariantIds.length > 0
    ? { ...summary, baseMachineVariantIds }
    : summary;
}

/** @param {unknown[]} items */
function byModelIdentity(items) {
  return [...items].sort((left, right) => {
    const leftModel = /** @type {Record<string, unknown>} */ (left);
    const rightModel = /** @type {Record<string, unknown>} */ (right);
    return String(leftModel.id ?? '').localeCompare(String(rightModel.id ?? ''), 'en');
  });
}

/** @param {Record<string, unknown>} catalog */
function modelsFrom(catalog) {
  return byModelIdentity(
    asArray(catalog?.models).filter(
      (model) => model && typeof model === 'object' && typeof model.id === 'string',
    ),
  );
}

/**
 * Resolve an exact model name, ID, or alias. A non-exact query is never silently
 * promoted to a technical fact.
 *
 * @param {Record<string, unknown>} catalog
 * @param {unknown} requestedModel
 */
function resolveModel(catalog, requestedModel) {
  const needle = normalize(requestedModel);
  if (!needle) return { status: 'needs_input', matches: [] };

  const exact = modelsFrom(catalog).filter((model) => modelTerms(model).includes(needle));
  if (exact.length === 1) return { status: 'ok', model: exact[0], matches: exact };
  if (exact.length > 1) return { status: 'ambiguous', matches: exact };

  return { status: 'not_found', matches: [] };
}

/** @param {Record<string, unknown>} capacity */
function capacityFluidTerms(capacity) {
  const fluid = capacity?.fluid;
  if (!fluid || typeof fluid !== 'object') return [];
  return [fluid.name, ...asArray(fluid.searchTerms)].map(normalize).filter(Boolean);
}

/** @param {Record<string, unknown>} capacity @param {string} requestedFluid */
function capacityMatchesFluid(capacity, requestedFluid) {
  const needle = normalize(requestedFluid);
  if (!needle) return true;

  const requestedViscosity = viscosityCstFromRequest(needle);
  const requestedTemperatures = temperatureRequestsFromRequest(needle);
  let fluidNeedle = needle;
  if (requestedViscosity !== null) {
    if (capacityViscosityCst(capacity) !== requestedViscosity) return false;
  }
  if (
    requestedTemperatures.length > 0 &&
    !requestedTemperatures.every((temperature) =>
      capacityHasTemperatureC(capacity, temperature.value, temperature.scope),
    )
  ) {
    return false;
  }

  fluidNeedle = stripFluidConditionPhrases(fluidNeedle);
  if (!fluidNeedle) return true;

  return capacityFluidTerms(capacity).some(
    (term) =>
      term === fluidNeedle || term.includes(fluidNeedle) || fluidNeedle.includes(term),
  );
}

/**
 * Remove common condition phrases from a natural-language fluid request after
 * validating any viscosity supplied by the caller. This lets inputs such as
 * "HFO 380 cSt at 50 C" resolve to the exact HFO row without treating those
 * qualifiers as part of the fluid name.
 *
 * @param {string} normalizedRequest
 */
function stripFluidConditionPhrases(normalizedRequest) {
  return normalizedRequest
    .replace(/\b\d+(?:\.\d+)?\s*cst\b/g, ' ')
    .replace(/\bhfo\s*\d+(?:\.\d+)?\b/g, 'hfo ')
    .replace(/\bheavy\s+fuel\s+oil\s+\d+(?:\.\d+)?\b/g, 'heavy fuel oil ')
    .replace(/\b(?:at\s+)?\d+(?:\.\d+)?\s+\d+(?:\.\d+)?\s*c\b/g, ' ')
    .replace(/\b(?:at\s+)?\d+(?:\.\d+)?\s*(?:degree\s+|degrees\s+)?c\b/g, ' ')
    .replace(/\b(?:at|and|for|with|temperature|temp|centrifuged|centrifugation)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {string} normalizedRequest */
function viscosityCstFromRequest(normalizedRequest) {
  const explicit = normalizedRequest.match(/\b(\d+(?:\.\d+)?)\s*cst\b/);
  if (explicit) return Number(explicit[1]);

  const hfoGrade = normalizedRequest.match(
    /\b(?:hfo\s*|heavy\s+fuel\s+oil\s+)(\d+(?:\.\d+)?)\b/,
  );
  return hfoGrade ? Number(hfoGrade[1]) : null;
}

/** @param {string} normalizedRequest */
function temperatureRequestsFromRequest(normalizedRequest) {
  const requests = [];
  const scopedSpans = [];
  const temperatureValue = '(\\d+(?:\\.\\d+)?)(?:\\s+(\\d+(?:\\.\\d+)?))?\\s*c';
  const scopedPatterns = [
    {
      scope: 'centrifugation',
      pattern: new RegExp(
        `\\b(?:centrifuged|centrifugation)(?:\\s+temperature)?\\s+(?:at\\s+)?${temperatureValue}\\b`,
        'g',
      ),
    },
    {
      scope: 'viscosity-reference',
      pattern: new RegExp(
        `\\b\\d+(?:\\.\\d+)?\\s*cst\\s+(?:measured\\s+)?(?:at\\s+)?${temperatureValue}\\b`,
        'g',
      ),
    },
    {
      scope: 'viscosity-reference',
      pattern: new RegExp(
        `\\bviscosity(?:\\s+reference)?(?:\\s+temperature)?\\s+(?:at\\s+)?${temperatureValue}\\b`,
        'g',
      ),
    },
  ];

  for (const { scope, pattern } of scopedPatterns) {
    for (const match of normalizedRequest.matchAll(pattern)) {
      requests.push({ value: Number(match[1]), scope });
      if (match[2] !== undefined) requests.push({ value: Number(match[2]), scope });
      scopedSpans.push([match.index, match.index + match[0].length]);
    }
  }

  const unscopedCharacters = [...normalizedRequest];
  for (const [start, end] of scopedSpans) {
    for (let index = start; index < end; index += 1) unscopedCharacters[index] = ' ';
  }

  for (const temperature of unscopedTemperaturesC(unscopedCharacters.join(''))) {
    requests.push({ value: temperature, scope: 'any' });
  }

  const seen = new Set();
  return requests.filter((request) => {
    if (!Number.isFinite(request.value)) return false;
    const key = `${request.scope}:${request.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** @param {string} normalizedRequest */
function unscopedTemperaturesC(normalizedRequest) {
  const temperatures = new Set();
  const rangePattern = /\b(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*c\b/g;
  for (const match of normalizedRequest.matchAll(rangePattern)) {
    temperatures.add(Number(match[1]));
    temperatures.add(Number(match[2]));
  }

  const withoutRanges = normalizedRequest.replace(rangePattern, ' ');
  for (const match of withoutRanges.matchAll(/\b(\d+(?:\.\d+)?)\s*c\b/g)) {
    temperatures.add(Number(match[1]));
  }
  return [...temperatures].filter(Number.isFinite);
}

/** @param {Record<string, unknown>} capacity */
function capacityViscosityCst(capacity) {
  const conditions = capacity?.conditions;
  if (!conditions || typeof conditions !== 'object') return null;
  const viscosity = conditions.viscosity;
  if (!viscosity || typeof viscosity !== 'object') return null;
  if (normalize(viscosity.unit) !== 'cst') return null;
  return typeof viscosity.value === 'number' && Number.isFinite(viscosity.value)
    ? viscosity.value
    : null;
}

/**
 * @param {Record<string, unknown>} capacity
 * @param {number} requestedTemperature
 * @param {'any'|'centrifugation'|'viscosity-reference'} scope
 */
function capacityHasTemperatureC(capacity, requestedTemperature, scope) {
  const conditions = capacity?.conditions;
  if (!conditions || typeof conditions !== 'object') return false;

  const candidates = [];
  if (scope === 'any') candidates.push(conditions.fluidTemperatureC);
  if (scope === 'any' || scope === 'centrifugation') {
    candidates.push(conditions.centrifugationTemperatureC);
  }
  const viscosity = conditions.viscosity;
  if (
    (scope === 'any' || scope === 'viscosity-reference') &&
    viscosity &&
    typeof viscosity === 'object'
  ) {
    candidates.push(viscosity.referenceTemperatureC);
  }

  return candidates.some((candidate) => temperatureConditionIncludes(candidate, requestedTemperature));
}

/** @param {unknown} condition @param {number} requestedTemperature */
function temperatureConditionIncludes(condition, requestedTemperature) {
  if (typeof condition === 'number') return condition === requestedTemperature;
  if (!condition || typeof condition !== 'object') return false;

  if (typeof condition.value === 'number') return condition.value === requestedTemperature;
  if (typeof condition.minimum === 'number' && typeof condition.maximum === 'number') {
    return requestedTemperature >= condition.minimum && requestedTemperature <= condition.maximum;
  }
  return false;
}

/** @param {Record<string, unknown>[]} capacities */
function capacitySources(capacities) {
  const seen = new Set();
  const sources = [];
  for (const capacity of capacities) {
    if (!capacity.source) continue;
    const key = stableStringify(capacity.source);
    if (!seen.has(key)) {
      seen.add(key);
      sources.push(capacity.source);
    }
  }
  return sources;
}

/** @param {unknown} specifications */
function specificationSources(specifications) {
  const seen = new Set();
  const sources = [];

  function visit(value) {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (!value || typeof value !== 'object') return;

    if (typeof value.sourceUrl === 'string') {
      const source = Object.fromEntries(
        ['basis', 'evidenceClass', 'publisher', 'sourceUrl', 'reviewedOn', 'reviewedBy', 'scopeNote']
          .filter((key) => value[key] !== undefined)
          .map((key) => [key, value[key]]),
      );
      const key = stableStringify(source);
      if (!seen.has(key)) {
        seen.add(key);
        sources.push(source);
      }
    }

    for (const item of Object.values(value)) visit(item);
  }

  visit(specifications);
  return sources;
}

/**
 * @param {Record<string, unknown>} catalog
 * @param {{query?: string, manufacturer?: string, recordType?: string, fluid?: string}} [input]
 */
export function findCentrifugeModels(catalog, input = {}) {
  const query = normalize(input.query);
  const manufacturer = normalize(input.manufacturer);
  const recordType = normalize(input.recordType);
  const fluid = normalize(input.fluid);

  const allModels = modelsFrom(catalog);
  const modelsById = new Map(allModels.map((model) => [String(model.id), model]));
  const matches = allModels.filter((model) => {
    if (query && !modelTerms(model).some((term) => term.includes(query))) return false;
    if (manufacturer && normalize(model.manufacturer) !== manufacturer) return false;
    if (recordType && normalize(model.recordType) !== recordType) return false;
    if (fluid) {
      const ownCapacityMatches = asArray(model.capacities).some((capacity) =>
        capacityMatchesFluid(/** @type {Record<string, unknown>} */ (capacity), fluid),
      );
      const documentedBaseMatches = asArray(model.baseMachineVariantIds).some((id) => {
        const baseModel = modelsById.get(String(id));
        return Boolean(
          baseModel &&
            asArray(baseModel.capacities).some((capacity) =>
              capacityMatchesFluid(/** @type {Record<string, unknown>} */ (capacity), fluid),
            ),
        );
      });
      if (!ownCapacityMatches && !documentedBaseMatches) return false;
    }
    return true;
  });

  return {
    schemaVersion: schemaVersion(catalog),
    status: matches.length > 0 ? 'ok' : 'not_found',
    data: {
      count: matches.length,
      models: matches.map(modelSummary),
    },
    answerability: {
      canStateAsFact: matches.length > 0,
      qualificationRequired: false,
      missingInputs: [],
    },
    warnings: [],
    sources: [],
  };
}

/**
 * @param {Record<string, unknown>} catalog
 * @param {{model?: string, baseMachineVariant?: string, baseMachineVariantId?: string}} input
 */
export function getCentrifugeSpecifications(catalog, input = {}) {
  const resolution = resolveModel(catalog, input.model);
  if (resolution.status !== 'ok') {
    return modelResolutionEnvelope(catalog, resolution, input.model);
  }

  const requestedModel = resolution.model;
  const baseVariantIds = asArray(requestedModel.baseMachineVariantIds);
  const requestedVariant = input.baseMachineVariant ?? input.baseMachineVariantId;
  const effectiveVariant = requestedVariant ?? (baseVariantIds.length === 1 ? baseVariantIds[0] : null);
  let selectedModel = requestedModel;
  const warnings = [];

  if (effectiveVariant) {
    const variantResolution = resolveModel(catalog, effectiveVariant);
    const exactModelVariantMismatch =
      baseVariantIds.length === 0 &&
      (variantResolution.status !== 'ok' || variantResolution.model.id !== requestedModel.id);
    if (
      exactModelVariantMismatch ||
      (baseVariantIds.length > 0 && variantResolution.status !== 'ok') ||
      (baseVariantIds.length > 0 && !baseVariantIds.includes(variantResolution.model.id))
    ) {
      return invalidBaseVariantEnvelope(
        catalog,
        requestedModel,
        effectiveVariant,
        baseVariantIds,
        'specifications',
      );
    }
    selectedModel = variantResolution.model;
  } else if (baseVariantIds.length > 1) {
    warnings.push(
      'These are commercial-class specifications. Select an exact base machine for variant-specific facts.',
    );
  }

  const selectedCommercialBase =
    baseVariantIds.length > 0 && selectedModel.id !== requestedModel.id;
  const needsBaseVariant = baseVariantIds.length > 1 && !effectiveVariant;
  const specifications = selectedCommercialBase
    ? {
        commercialClass: requestedModel.specifications ?? {},
        baseMachine: selectedModel.specifications ?? {},
      }
    : selectedModel.specifications ?? {};
  const sources = specificationSources(specifications);

  if (sources.length === 0) {
    return {
      schemaVersion: schemaVersion(catalog),
      status: 'not_found',
      data: {
        requestedModel: modelSummary(requestedModel),
        selectedModel: modelSummary(selectedModel),
        specifications: {},
      },
      answerability: {
        canStateAsFact: false,
        qualificationRequired: true,
        missingInputs: [],
      },
      warnings: ['No source-backed specifications are published for this exact model.'],
      sources: [],
    };
  }

  if (
    selectedCommercialBase &&
    Object.keys(selectedModel.specifications ?? {}).length === 0
  ) {
    warnings.push(
      'Commercial-class specifications are published, but no base-machine specifications are available for the selected exact variant.',
    );
  }

  return {
    schemaVersion: schemaVersion(catalog),
    status: 'ok',
    data: {
      requestedModel: modelSummary(requestedModel),
      selectedModel: modelSummary(selectedModel),
      specifications,
      ...(baseVariantIds.length > 1 && !effectiveVariant
        ? { baseMachineVariants: variantSummaries(catalog, baseVariantIds) }
        : {}),
    },
    answerability: {
      canStateAsFact: true,
      qualificationRequired: warnings.length > 0,
      missingInputs: needsBaseVariant ? ['baseMachineVariant for variant-specific facts'] : [],
    },
    warnings,
    sources,
  };
}

/**
 * @param {Record<string, unknown>} catalog
 * @param {{model?: string, fluid?: string, baseMachineVariant?: string, baseMachineVariantId?: string}} input
 */
export function getCentrifugeCapacity(catalog, input = {}) {
  const resolution = resolveModel(catalog, input.model);
  if (resolution.status !== 'ok') {
    return modelResolutionEnvelope(catalog, resolution, input.model);
  }

  const requestedModel = resolution.model;
  const baseVariantIds = asArray(requestedModel.baseMachineVariantIds);
  const requestedVariant = input.baseMachineVariant ?? input.baseMachineVariantId;
  const effectiveVariant = requestedVariant ?? (baseVariantIds.length === 1 ? baseVariantIds[0] : null);
  let selectedModel = requestedModel;

  // This is the key anti-hallucination boundary: commercial names are not a
  // universal flow rating and may refer to materially different OEM machines.
  if (baseVariantIds.length > 1 && !effectiveVariant) {
    return {
      schemaVersion: schemaVersion(catalog),
      status: 'ambiguous',
      data: {
        requestedModel: modelSummary(requestedModel),
        requestedFluid: input.fluid ?? null,
        baseMachineVariants: variantSummaries(catalog, baseVariantIds),
        capacities: [],
      },
      answerability: {
        canStateAsFact: false,
        qualificationRequired: true,
        missingInputs: ['baseMachineVariant'],
      },
      warnings: [
        'A commercial class does not have one universal numeric capacity. Select the exact base machine.',
      ],
      sources: [],
    };
  }

  if (effectiveVariant) {
    const variantResolution = resolveModel(catalog, effectiveVariant);
    const exactModelVariantMismatch =
      baseVariantIds.length === 0 &&
      (variantResolution.status !== 'ok' || variantResolution.model.id !== requestedModel.id);
    if (
      exactModelVariantMismatch ||
      (baseVariantIds.length > 0 && variantResolution.status !== 'ok') ||
      (baseVariantIds.length > 0 && !baseVariantIds.includes(variantResolution.model.id))
    ) {
      return invalidBaseVariantEnvelope(
        catalog,
        requestedModel,
        effectiveVariant,
        baseVariantIds,
        'capacity',
      );
    }
    selectedModel = variantResolution.model;
  }

  const capacities = asArray(selectedModel.capacities)
    .filter((capacity) =>
      capacityMatchesFluid(/** @type {Record<string, unknown>} */ (capacity), input.fluid ?? ''),
    )
    .map((capacity) => /** @type {Record<string, unknown>} */ (capacity));

  if (capacities.length === 0) {
    return {
      schemaVersion: schemaVersion(catalog),
      status: 'not_found',
      data: {
        requestedModel: modelSummary(requestedModel),
        selectedModel: modelSummary(selectedModel),
        requestedFluid: input.fluid ?? null,
        capacities: [],
      },
      answerability: {
        canStateAsFact: false,
        qualificationRequired: true,
        missingInputs: [],
      },
      warnings: [
        input.fluid
          ? 'No source-backed capacity is published for this model and fluid.'
          : 'No source-backed capacities are published for this model.',
      ],
      sources: [],
    };
  }

  return {
    schemaVersion: schemaVersion(catalog),
    status: 'ok',
    data: {
      requestedModel: modelSummary(requestedModel),
      selectedModel: modelSummary(selectedModel),
      requestedFluid: input.fluid ?? null,
      capacities,
    },
    answerability: {
      canStateAsFact: true,
      qualificationRequired: true,
      missingInputs: [],
    },
    warnings: [
      'Apply the stated fluid, viscosity, temperature, and rating basis; do not transfer this capacity to another fluid or OEM platform.',
    ],
    sources: capacitySources(capacities),
  };
}

/**
 * Deterministic JSON serialization for WebMCP results and tests.
 * @param {unknown} value
 */
export function stableStringify(value) {
  return JSON.stringify(sortJson(value));
}

/** @param {unknown} value @returns {unknown} */
function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([key, item]) => [key, sortJson(item)]),
  );
}

/** @param {Record<string, unknown>} catalog @param {unknown[]} ids */
function variantSummaries(catalog, ids) {
  const allowed = new Set(ids.map(String));
  return modelsFrom(catalog)
    .filter((model) => allowed.has(String(model.id)))
    .map(modelSummary);
}

/**
 * Return a non-answer envelope when a caller tries to use a base-machine
 * selector outside the requested model's documented commercial-class mapping.
 * In particular, a baseMachineVariant can never redirect an exact OEM request
 * to a different OEM platform.
 *
 * @param {Record<string, unknown>} catalog
 * @param {Record<string, unknown>} requestedModel
 * @param {unknown} requestedVariant
 * @param {unknown[]} baseVariantIds
 * @param {'capacity'|'specifications'} resultKind
 */
function invalidBaseVariantEnvelope(
  catalog,
  requestedModel,
  requestedVariant,
  baseVariantIds,
  resultKind,
) {
  const isExactOemRequest = baseVariantIds.length === 0;
  return {
    schemaVersion: schemaVersion(catalog),
    status: isExactOemRequest ? 'invalid_input' : 'not_found',
    data: {
      requestedModel: modelSummary(requestedModel),
      requestedBaseMachineVariant: requestedVariant,
      allowedBaseMachineVariants: isExactOemRequest
        ? [modelSummary(requestedModel)]
        : variantSummaries(catalog, baseVariantIds),
      ...(resultKind === 'capacity' ? { capacities: [] } : {}),
    },
    answerability: {
      canStateAsFact: false,
      qualificationRequired: true,
      missingInputs: isExactOemRequest
        ? []
        : ['a valid baseMachineVariant for this commercial class'],
    },
    warnings: [
      isExactOemRequest
        ? 'baseMachineVariant cannot redirect an exact OEM model to another platform. Query the intended OEM model directly.'
        : 'The requested base machine is not a documented variant of this model.',
    ],
    sources: [],
  };
}

/**
 * @param {Record<string, unknown>} catalog
 * @param {{status: string, matches: Record<string, unknown>[]}} resolution
 * @param {unknown} requestedModel
 */
function modelResolutionEnvelope(catalog, resolution, requestedModel) {
  const isMissing = resolution.status === 'needs_input';
  const isAmbiguous = resolution.status === 'ambiguous';
  return {
    schemaVersion: schemaVersion(catalog),
    status: resolution.status,
    data: {
      requestedModel: requestedModel ?? null,
      candidates: resolution.matches.map(modelSummary),
    },
    answerability: {
      canStateAsFact: false,
      qualificationRequired: true,
      missingInputs: isMissing ? ['model'] : [],
    },
    warnings: [
      isMissing
        ? 'Provide an exact model, commercial class, or documented alias.'
        : isAmbiguous
          ? 'The model name matches more than one record; select an exact model ID.'
          : 'No exact model or documented alias was found.',
    ],
    sources: [],
  };
}
