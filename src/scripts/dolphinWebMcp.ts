import { selectCentrifugeCandidates } from '../lib/centrifugeSelection.mjs';
import { inquiryWebMcpTools } from './inquiryWebMcp';
import { compactToolResult } from '../lib/webMcpResponse.mjs';
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
    readOnlyHint: boolean;
    untrustedContentHint: boolean;
    consequentialHint: boolean;
  };
  execute: (input: JsonObject, context?: ToolExecutionContext) => Promise<JsonObject>;
};
type ModelContext = { registerTool: (tool: WebMcpTool) => unknown };

let catalogCache: JsonObject | undefined;
let authorCache: JsonObject | undefined;
const registrationsByContext = new WeakMap<ModelContext, Map<string, Promise<boolean>>>();

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
  if (catalog.schemaVersion !== 'dolphin-centrifuge-technical-v1' || !Array.isArray(catalog.models)) throw new Error('DOLPHIN_TECHNICAL_DATA_INVALID');
  catalogCache = catalog;
  return catalog;
}

async function getAuthor(signal?: AbortSignal): Promise<JsonObject> {
  const author = await fetchJson(AUTHOR_URL, signal, authorCache);
  if (!author.profile || !author.canonicalEntityId || !author.credential) throw new Error('DOLPHIN_AUTHOR_DATA_INVALID');
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

function invalidInputResult(message: string): JsonObject {
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
      message,
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

function validateInput(input: unknown, schema: JsonObject): string | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Expected an object of named parameters.';
  const fields = input as JsonObject;
  const properties = schema.properties as Record<string, JsonObject>;
  for (const name of (schema.required as string[] | undefined) ?? []) {
    if (!Object.hasOwn(fields, name)) return `Missing required parameter: ${name}.`;
  }
  for (const [name, value] of Object.entries(fields)) {
    if (!Object.hasOwn(properties, name)) return 'An unknown parameter was supplied. Use the declared tool schema.';
    const rule = properties[name];
    if (rule.type === 'integer') {
      if (!Number.isSafeInteger(value) || (value as number) < 0) return `${name} must be a nonnegative integer.`;
    } else if (rule.type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) return `${name} must be a finite number.`;
      if (rule.exclusiveMinimum !== undefined && value <= Number(rule.exclusiveMinimum)) return `${name} must be positive.`;
    } else {
      if (typeof value !== 'string') return `${name} must be a string.`;
      if (value.length > Number(rule.maxLength ?? MAX_TOOL_INPUT_LENGTH)) return `${name} exceeds the character limit.`;
      if (rule.minLength && !value.trim()) return `${name} must contain a value.`;
      if (Array.isArray(rule.enum) && !rule.enum.includes(value)) return `${name} must match a declared option.`;
    }
  }
}

const pagination = {
  offset: { type: 'integer', minimum: 0, description: 'Result offset; use the returned page.nextOffset to read the next page. Defaults to 0.' },
};

const annotations = {
  readOnlyHint: true,
  untrustedContentHint: false,
  consequentialHint: false,
} as const;

function tools(): WebMcpTool[] {
  return [
    {
      name: 'select_centrifuge_candidates',
      title: 'Select centrifuge candidates',
      description: 'Shortlist exact machines for a documented fluid and required flow, such as diesel at 10 US GPM. Ranks by smallest qualifying OEM application capacity. Returns one candidate per page, operating conditions and missing inputs. This is an engineering shortlist, not a purchase recommendation or guaranteed throughput.',
      inputSchema: {type: 'object', additionalProperties: false, required: ['application', 'requiredFlow', 'flowUnit'], properties: {
        ...pagination,
        application: {type: 'string', minLength: 1, maxLength: 200, description: 'Documented fluid, such as diesel, marine diesel or HFO 380 cSt. Application capacity is never borrowed from another fluid.'},
        requiredFlow: {type: 'number', exclusiveMinimum: 0, description: 'Required process flow, in the explicitly selected flowUnit.'},
        flowUnit: {type: 'string', enum: ['US GPM', 'L/h'], description: 'US gallons per minute or liters per hour; imperial gallons are not US gallons.'},
        cleaning: {type: 'string', enum: ['any', 'manual', 'self-cleaning'], description: 'Solids discharge preference. Defaults to any.'},
        temperatureC: {type: 'number', description: 'Actual fluid temperature at the centrifuge, degrees Celsius; omitted means unconfirmed.'},
        viscosityCst: {type: 'number', exclusiveMinimum: 0, description: 'Fluid viscosity or fuel grade in cSt. Its reference temperature is separate from centrifugation temperature.'},
        viscosityReferenceTemperatureC: {type: 'number', description: 'Temperature at which viscosity is measured, degrees Celsius; for example HFO 380 cSt at 50 C.'},
      }},
      annotations,
      execute: (input, context) => withCatalog(context, catalog => selectCentrifugeCandidates(catalog, input)),
    },
    {
      name: 'find_centrifuge_models',
      title: 'Find centrifuge models',
      description:
        'Find source-backed Dolphin and OEM centrifuge records by model, alias, manufacturer, record type, or documented fluid. Returns three models per page. Use page.nextOffset for more results and an exact model ID for technical lookups.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ...pagination,
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
        withCatalog(context, (catalog) => compactToolResult(findCentrifugeModels(catalog, input), input)),
    },
    {
      name: 'get_centrifuge_specifications',
      title: 'Get centrifuge specifications',
      description:
        'Return one source-backed specification per page for an exact model. Optionally request a field such as motorPower, bowlSpeed or netWeight. Motor variants require configurationId from the model record. Use page.nextOffset for more fields and baseMachineVariant to select a commercial class’s exact machine.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['model'],
        properties: {
          ...pagination,
          model: { type: 'string', minLength: 1, maxLength: MAX_TOOL_INPUT_LENGTH, description: 'Exact model ID, name, or alias.' },
          field: {type: 'string', minLength: 1, maxLength: 200, description: 'Optional exact field, such as motorPower, bowlSpeed or netWeight. Omit to enumerate all fields.'},
          configurationId: {type: 'string', minLength: 1, maxLength: 200, description: 'Exact documented configuration ID from the model record, required to resolve pump-dependent motor power.'},
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
        withCatalog(context, (catalog) => compactToolResult(getCentrifugeSpecifications(catalog, input), input)),
    },
    {
      name: 'get_centrifuge_capacity',
      title: 'Get centrifuge capacity',
      description:
        'Return one source-backed capacity per page with fluid, conditions, rating basis, units, and provenance. Use page.nextOffset for more records. A commercial class with multiple documented base machines requires an exact variant and never receives a synthesized universal flow rating.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['model'],
        properties: {
          ...pagination,
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
        withCatalog(context, (catalog) => compactToolResult(getCentrifugeCapacity(catalog, input), input)),
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
            data: {
              name: (author.profile as JsonObject)?.name,
              url: author.canonicalProfile,
              id: author.canonicalEntityId,
              credential: author.credential,
              lastVerified: author.lastVerified,
              recordUrl: AUTHOR_URL,
            },
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

/** Register each tool independently so one failure cannot strand the others. */
export async function registerDolphinWebMcpTools(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') return false;
  let registrations = registrationsByContext.get(modelContext);
  if (!registrations) {
    registrations = new Map();
    registrationsByContext.set(modelContext, registrations);
  }
  const state = registrations;
  const results = await Promise.all([...tools(), ...inquiryWebMcpTools()].map((definition) => {
    const prior = state.get(definition.name);
    if (prior) return prior;
    const tool = {
      ...definition,
      execute: async (input: JsonObject, context?: ToolExecutionContext): Promise<JsonObject> => {
        abortSignal(context)?.throwIfAborted();
        const invalid = validateInput(input, definition.inputSchema);
        if (invalid) return invalidInputResult(invalid);
        return definition.execute(input, context);
      },
    };
    const registration = Promise.resolve()
      .then(() => modelContext.registerTool(tool))
      .then(() => true)
      .catch(() => {
        state.delete(definition.name);
        console.warn('Dolphin WebMCP tool registration failed.', definition.name);
        return false;
      });
    state.set(definition.name, registration);
    return registration;
  }));
  return results.every(Boolean);
}

void registerDolphinWebMcpTools();
