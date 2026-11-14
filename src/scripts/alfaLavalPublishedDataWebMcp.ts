// WebMCP tools for the figures Alfa Laval printed in six selected documents.
// list_alfa_laval_published_documents and get_alfa_laval_published_figures are read-only
// and registered sitewide through registerDolphinWebMcpTools (dolphinWebMcp.ts), which
// supplies JSON-string input parsing, schema validation and independent per-tool registration.
import {
  ALFA_LAVAL_DATA_PATH,
  ALFA_LAVAL_DATA_SCHEMA,
  ALFA_LAVAL_DATA_URL,
  FIGURES_STATEMENT,
  GET_FIGURES_DESCRIPTION,
  GET_FIGURES_TOOL,
  LIST_DOCUMENTS_DESCRIPTION,
  LIST_DOCUMENTS_TOOL,
  READING_NOTE,
  isAlfaLavalPublishedData,
  listPublishedDocuments,
  lookupPublishedFigures,
} from '../lib/alfaLavalPublishedData.mjs';

type JsonObject = Record<string, any>;
type Context = { signal?: AbortSignal };
type Deps = { fetchJson: (url: string, signal?: AbortSignal) => Promise<JsonObject> };

const SECTIONS_PER_PAGE = 4;

let dataCache: JsonObject | undefined;

async function getPublishedData(deps: Deps, signal?: AbortSignal): Promise<JsonObject> {
  if (dataCache) return dataCache;
  const data = await deps.fetchJson(ALFA_LAVAL_DATA_PATH, signal);
  if (!isAlfaLavalPublishedData(data)) throw new Error('DOLPHIN_ALFA_LAVAL_DATA_INVALID');
  dataCache = data;
  return data;
}

function result(status: string, data: JsonObject | null, warnings: string[]): JsonObject {
  return {
    schemaVersion: ALFA_LAVAL_DATA_SCHEMA,
    status,
    data,
    answerability: { canStateAsFact: status === 'ok', qualificationRequired: true, missingInputs: [] },
    warnings,
    sources: status === 'ok' ? [ALFA_LAVAL_DATA_URL] : [],
  };
}

async function withPublishedData(
  context: Context | undefined,
  deps: Deps,
  query: (data: JsonObject) => JsonObject,
): Promise<JsonObject> {
  const signal = context?.signal;
  signal?.throwIfAborted();
  let data: JsonObject;
  try {
    data = await getPublishedData(deps, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    return result('unavailable', null, ['The same-origin Alfa Laval published data is temporarily unavailable.']);
  }
  return query(data);
}

function listDocuments(data: JsonObject): JsonObject {
  return result('ok', {
    maker: data.maker,
    basis: data.basis,
    statement: FIGURES_STATEMENT,
    documents: listPublishedDocuments(data),
    record: ALFA_LAVAL_DATA_URL,
  }, [FIGURES_STATEMENT]);
}

/** Pages over sections (four per page); each page repeats its document's number and date. */
function getFigures(data: JsonObject, input: JsonObject): JsonObject {
  const found: JsonObject = lookupPublishedFigures(data, { model: input.model, document: input.document });
  if (found.status === 'not_found') {
    return result('not_found', {
      requestedModel: input.model,
      coveredMachines: found.coveredMachines,
      documents: found.documents,
    }, [`No Alfa Laval published figures for "${input.model}". Covered machines: ${found.coveredMachines.join(', ')}.`]);
  }
  if (found.status === 'document_not_found') {
    return result('not_found', {
      machine: found.machine,
      requestedDocument: input.document,
      documents: found.documents,
    }, [`The named document does not cover ${found.machine.model}. Documents that do: ${found.documents.map((doc: JsonObject) => doc.documentNumber).join('; ')}.`]);
  }

  const all = found.documents.flatMap((doc: JsonObject) => doc.sections.map((section: JsonObject) => ({ doc, section })));
  const offset = input.offset ?? 0;
  if (offset >= all.length) return result('invalid_input', null, ['Offset is outside the results. Retry with offset 0.']);
  const shown = all.slice(offset, offset + SECTIONS_PER_PAGE);
  const byDocument = new Map<string, JsonObject>();
  for (const { doc, section } of shown) {
    const header = Object.fromEntries(Object.entries(doc).filter(([key]) => key !== 'sections'));
    const entry: JsonObject = byDocument.get(doc.document) ?? { ...header, sections: [] };
    byDocument.set(doc.document, entry);
    entry.sections.push(section);
  }
  const documents = [...byDocument.values()];
  const nextOffset = offset + shown.length < all.length ? offset + shown.length : null;
  return {
    ...result('ok', {
      machine: found.machine,
      maker: data.maker,
      basis: data.basis,
      statement: FIGURES_STATEMENT,
      reading: READING_NOTE,
      documents,
      record: ALFA_LAVAL_DATA_URL,
    }, [FIGURES_STATEMENT, READING_NOTE]),
    page: { offset, total: all.length, nextOffset },
  };
}

const annotations = { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false };

export function alfaLavalPublishedDataWebMcpTools(deps: Deps) {
  return [
    {
      name: LIST_DOCUMENTS_TOOL,
      title: 'List Alfa Laval published documents',
      description: LIST_DOCUMENTS_DESCRIPTION,
      inputSchema: { type: 'object', additionalProperties: false, properties: {} },
      annotations,
      execute: (_input: JsonObject, context?: Context) => withPublishedData(context, deps, listDocuments),
    },
    {
      name: GET_FIGURES_TOOL,
      title: 'Get Alfa Laval published figures',
      description: GET_FIGURES_DESCRIPTION,
      inputSchema: {
        type: 'object', additionalProperties: false, required: ['model'], properties: {
          offset: { type: 'integer', minimum: 0, description: 'Section offset; use the returned page.nextOffset to read the next page. Defaults to 0.' },
          model: { type: 'string', minLength: 1, maxLength: 200, description: 'Machine model, such as "MAB 204", "MAB 204S", "MAB-204" or "MOPX 207".' },
          document: { type: 'string', minLength: 1, maxLength: 200, description: 'Optional Alfa Laval document number or id, such as "TD S93303E" or "MPCO 20-00-02". Omit for every document that covers the machine.' },
        },
      },
      annotations,
      execute: (input: JsonObject, context?: Context) => withPublishedData(context, deps, (data) => getFigures(data, input)),
    },
  ];
}
