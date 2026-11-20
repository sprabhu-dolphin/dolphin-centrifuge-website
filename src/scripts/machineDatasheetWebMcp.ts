// WebMCP tools for the Alfa Laval machine data sheets.
// get_machine_datasheet returns one whole machine record in one call; list_machines returns the
// short index. Both are read-only and registered sitewide through registerDolphinWebMcpTools
// (dolphinWebMcp.ts), which supplies JSON-string input parsing, schema validation and
// independent per-tool registration. Matching and answers come from src/lib/machineDatasheets.mjs,
// the same module the /mcp Worker uses.
import {
  DATASHEET_STATEMENT,
  GET_DATASHEET_DESCRIPTION,
  GET_DATASHEET_TOOL,
  LIST_MACHINES_DESCRIPTION,
  LIST_MACHINES_TOOL,
  MACHINE_DATASHEETS_PATH,
  MACHINE_DATASHEETS_SCHEMA,
  MACHINE_DATASHEETS_URL,
  getMachineDatasheet,
  isMachineDatasheetData,
  listMachines,
} from '../lib/machineDatasheets.mjs';

type JsonObject = Record<string, any>;
type Context = { signal?: AbortSignal };
type Deps = { fetchJson: (url: string, signal?: AbortSignal) => Promise<JsonObject> };

let dataCache: JsonObject | undefined;

async function getData(deps: Deps, signal?: AbortSignal): Promise<JsonObject> {
  if (dataCache) return dataCache;
  const data = await deps.fetchJson(MACHINE_DATASHEETS_PATH, signal);
  if (!isMachineDatasheetData(data)) throw new Error('DOLPHIN_MACHINE_DATASHEETS_INVALID');
  dataCache = data;
  return data;
}

function result(status: string, data: JsonObject | null, warnings: string[]): JsonObject {
  return {
    schemaVersion: MACHINE_DATASHEETS_SCHEMA,
    status,
    data,
    answerability: { canStateAsFact: status === 'ok', qualificationRequired: true, missingInputs: [] },
    warnings,
    sources: status === 'ok' ? [MACHINE_DATASHEETS_URL] : [],
  };
}

async function withData(
  context: Context | undefined,
  deps: Deps,
  query: (data: JsonObject) => JsonObject,
): Promise<JsonObject> {
  const signal = context?.signal;
  signal?.throwIfAborted();
  let data: JsonObject;
  try {
    data = await getData(deps, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    return result('unavailable', null, ['The same-origin machine data sheets are temporarily unavailable.']);
  }
  return query(data);
}

const annotations = { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false };

export function machineDatasheetWebMcpTools(deps: Deps) {
  return [
    {
      name: GET_DATASHEET_TOOL,
      title: 'Get machine data sheet',
      description: GET_DATASHEET_DESCRIPTION,
      inputSchema: {
        type: 'object', additionalProperties: false, required: ['model'], properties: {
          model: { type: 'string', minLength: 1, maxLength: 200, description: 'Machine model written any way, such as "MOPX 207", "MOPX207", "WHPX 510TGD" or "MAB 204S". A bare family such as "MOPX" returns the list of models.' },
        },
      },
      annotations,
      execute: (input: JsonObject, context?: Context) => withData(context, deps, (data) => {
        const answer = getMachineDatasheet(data, { model: input.model });
        const { status, ...rest } = answer;
        return result(status === 'ok' ? 'ok' : status, status === 'invalid_input' || status === 'no_suitability_statement' ? null : rest, [DATASHEET_STATEMENT]);
      }),
    },
    {
      name: LIST_MACHINES_TOOL,
      title: 'List machines with data sheets',
      description: LIST_MACHINES_DESCRIPTION,
      inputSchema: {
        type: 'object', additionalProperties: false, properties: {
          type: { type: 'string', maxLength: 80, description: 'Optional machine type filter, such as "disc stack", "self-cleaning" or "manual-clean".' },
          maker: { type: 'string', maxLength: 80, description: 'Optional maker filter, such as "Alfa Laval".' },
        },
      },
      annotations,
      execute: (input: JsonObject, context?: Context) => withData(context, deps, (data) => {
        const { status, ...rest } = listMachines(data, { type: input.type, maker: input.maker });
        return result(status, rest, [DATASHEET_STATEMENT]);
      }),
    },
  ];
}
