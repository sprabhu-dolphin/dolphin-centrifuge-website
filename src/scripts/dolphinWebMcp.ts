import {
  findCentrifugeModels,
  getCentrifugeCapacity,
  getCentrifugeSpecifications,
} from '../lib/agentCatalogQuery.mjs';

const CATALOG_URL = '/technical-data/centrifuges.v1.json';
const AUTHOR_URL = '/authors/sanjay-prabhu.json';
const MAX_TOOL_INPUT_LENGTH = 200;

type JsonObject = Record<string, unknown>;
type ToolExecutionContext = { signal?: AbortSignal };
type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonObject;
  annotations: {
    readOnlyHint: true;
    untrustedContentHint: false;
  };
  execute: (input: JsonObject, context?: ToolExecutionContext) => Promise<JsonObject>;
};
type ModelContext = { registerTool: (tool: WebMcpTool) => unknown };

let catalogCache: JsonObject | undefined;
let authorCache: JsonObject | undefined;
let registeredContext: ModelContext | undefined;
let registeringContext: ModelContext | undefined;

function abortSignal(context?: ToolExecutionContext): AbortSignal | undefined {
  return context?.signal instanceof AbortSignal ? context.signal : undefined;
}

async function fetchJson(
  url: string,
  signal: AbortSignal | undefined,
  cached: JsonObject | undefined,
): Promise<JsonObject> {
  signal?.throwIfAborted();
  if (cached) return cached;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    signal,
  });
  if (!response.ok) throw new Error('DOLPHIN_TECHNICAL_DATA_UNAVAILABLE');

  const payload: unknown = await response.json();
  signal?.throwIfAborted();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('DOLPHIN_TECHNICAL_DATA_INVALID');
  }
  return payload as JsonObject;
}

async function getCatalog(signal?: AbortSignal): Promise<JsonObject> {
  const catalog = await fetchJson(CATALOG_URL, signal, catalogCache);
  catalogCache = catalog;
  return catalog;
}

async function getAuthor(signal?: AbortSignal): Promise<JsonObject> {
  const author = await fetchJson(AUTHOR_URL, signal, authorCache);
  authorCache = author;
  return author;
}

function unavailableResult(resource: 'catalog' | 'author'): JsonObject {
  return {
    schemaVersion:
      resource === 'author' ? 'dolphin.author-identity.v1' : 'dolphin-centrifuge-technical-v1',
    status: 'unavailable',
    data: null,
    answerability: {
      canStateAsFact: false,
      qualificationRequired: true,
      missingInputs: [],
    },
    warnings: [
      resource === 'catalog'
        ? 'The same-origin Dolphin technical catalog is temporarily unavailable.'
        : 'The same-origin authoritative author record is temporarily unavailable.',
    ],
    sources: [],
  };
}

function invalidInputResult(fields: string[]): JsonObject {
  return {
    schemaVersion: 'dolphin-centrifuge-technical-v1',
    status: 'invalid_input',
    data: null,
    answerability: {
      canStateAsFact: false,
      qualificationRequired: true,
      missingInputs: [],
    },
    warnings: [
      `Input exceeds the ${MAX_TOOL_INPUT_LENGTH}-character limit: ${fields.join(', ')}.`,
    ],
    sources: [],
  };
}

async function withCatalog(
  context: ToolExecutionContext | undefined,
  query: (catalog: JsonObject) => JsonObject,
): Promise<JsonObject> {
  const signal = abortSignal(context);
  try {
    return query(await getCatalog(signal));
  } catch (error) {
    if (signal?.aborted) throw error;
    return unavailableResult('catalog');
  }
}

async function withBoundedCatalogInput(
  input: JsonObject,
  context: ToolExecutionContext | undefined,
  query: (catalog: JsonObject) => JsonObject,
): Promise<JsonObject> {
  const overLimit = Object.entries(input)
    .filter(([, value]) => typeof value === 'string' && value.length > MAX_TOOL_INPUT_LENGTH)
    .map(([key]) => key);
  if (overLimit.length > 0) return invalidInputResult(overLimit);
  return withCatalog(context, query);
}

const annotations = {
  readOnlyHint: true,
  untrustedContentHint: false,
} as const;

function tools(): WebMcpTool[] {
  return [
    {
      name: 'find_centrifuge_models',
      title: 'Find centrifuge models',
      description:
        'Find source-backed Dolphin and OEM centrifuge records by model, alias, manufacturer, record type, or documented fluid. Use an exact returned model ID for technical lookups.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          query: { type: 'string', maxLength: MAX_TOOL_INPUT_LENGTH, description: 'Model name, ID, family, or documented alias.' },
          manufacturer: { type: 'string', maxLength: MAX_TOOL_INPUT_LENGTH, description: 'Exact manufacturer name.' },
          recordType: {
            type: 'string',
            maxLength: MAX_TOOL_INPUT_LENGTH,
            enum: ['oem-base-machine', 'dolphin-commercial-class'],
            description: 'Exact catalog record type.',
          },
          fluid: { type: 'string', maxLength: MAX_TOOL_INPUT_LENGTH, description: 'Fluid with a documented capacity record.' },
        },
      },
      annotations,
      execute: (input, context) =>
        withBoundedCatalogInput(input, context, (catalog) => findCentrifugeModels(catalog, input)),
    },
    {
      name: 'get_centrifuge_specifications',
      title: 'Get centrifuge specifications',
      description:
        'Return source-backed specifications for an exact model or alias. For a commercial class, optionally select an exact documented base-machine variant for variant-specific facts.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['model'],
        properties: {
          model: { type: 'string', minLength: 1, maxLength: MAX_TOOL_INPUT_LENGTH, description: 'Exact model ID, name, or alias.' },
          baseMachineVariant: {
            type: 'string',
            minLength: 1,
            maxLength: MAX_TOOL_INPUT_LENGTH,
            description: 'Exact OEM base-machine model ID, name, or alias.',
          },
        },
      },
      annotations,
      execute: (input, context) =>
        withBoundedCatalogInput(input, context, (catalog) => getCentrifugeSpecifications(catalog, input)),
    },
    {
      name: 'get_centrifuge_capacity',
      title: 'Get centrifuge capacity',
      description:
        'Return source-backed capacity records with fluid, conditions, rating basis, original value, derived conversions, and provenance. A commercial class with multiple documented base machines requires an exact variant and never receives a synthesized universal flow rating.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['model'],
        properties: {
          model: { type: 'string', minLength: 1, maxLength: MAX_TOOL_INPUT_LENGTH, description: 'Exact model ID, name, or alias.' },
          fluid: {
            type: 'string',
            minLength: 1,
            maxLength: MAX_TOOL_INPUT_LENGTH,
            description: 'Fluid name or documented search term, for example marine diesel or HFO 380 cSt.',
          },
          baseMachineVariant: {
            type: 'string',
            minLength: 1,
            maxLength: MAX_TOOL_INPUT_LENGTH,
            description: 'Required for a commercial class with multiple documented base machines: exact OEM model ID, name, or alias.',
          },
        },
      },
      annotations,
      execute: (input, context) =>
        withBoundedCatalogInput(input, context, (catalog) => getCentrifugeCapacity(catalog, input)),
    },
    {
      name: 'get_technical_author_identity',
      title: 'Get technical author identity',
      description:
        'Return Dolphin Centrifuge technical author Sanjay Prabhu’s canonical, same-origin identity and published credential record.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {},
      },
      annotations,
      execute: async (_input, context) => {
        const signal = abortSignal(context);
        try {
          const author = await getAuthor(signal);
          return {
            schemaVersion: 'dolphin.author-identity.v1',
            status: 'ok',
            data: author,
            answerability: {
              canStateAsFact: true,
              qualificationRequired: false,
              missingInputs: [],
            },
            warnings: [],
            sources: [AUTHOR_URL],
          };
        } catch (error) {
          if (signal?.aborted) throw error;
          return unavailableResult('author');
        }
      },
    },
  ];
}

/**
 * Register Dolphin's four read-only WebMCP tools when the experimental browser
 * API exists. Unsupported browsers intentionally receive no shim or polyfill.
 */
export function registerDolphinWebMcpTools(): boolean {
  if (typeof document === 'undefined') return false;

  const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') return false;
  if (registeredContext === modelContext || registeringContext === modelContext) return true;

  registeringContext = modelContext;
  let registrations: Promise<unknown>[];
  try {
    registrations = tools().map((tool) => Promise.resolve(modelContext.registerTool(tool)));
  } catch (error) {
    registeringContext = undefined;
    console.warn('Dolphin WebMCP tool registration failed.', error);
    return false;
  }

  void Promise.all(registrations)
    .then(() => {
      registeredContext = modelContext;
      registeringContext = undefined;
    })
    .catch((error) => {
      registeringContext = undefined;
      console.warn('Dolphin WebMCP tool registration failed.', error);
    });
  return true;
}

registerDolphinWebMcpTools();
