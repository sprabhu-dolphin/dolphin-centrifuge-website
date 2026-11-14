// Alfa Laval published figures (schema dolphin.alfa-laval-published-data.v1).
// Pure lookups shared by the WebMCP tools (src/scripts/alfaLavalPublishedDataWebMcp.ts)
// and the remote MCP server (workers/dolphin-mcp). Every value passes through exactly
// as printed by Alfa Laval; nothing is converted, calculated or merged with other data.
export const ALFA_LAVAL_DATA_SCHEMA = 'dolphin.alfa-laval-published-data.v1';
export const ALFA_LAVAL_DATA_PATH = '/technical-data/alfa-laval-published-data.v1.json';
export const ALFA_LAVAL_DATA_URL = `https://dolphincentrifuge.com${ALFA_LAVAL_DATA_PATH}`;
export const NOT_OFFERED = 'not offered';
export const FIGURES_STATEMENT =
  'Figures as printed by Alfa Laval in the named document, units as printed. They are not Dolphin measurements, guarantees or ratings. Nothing is converted or calculated.';
export const READING_NOTE =
  `"${NOT_OFFERED}" marks a printed cell that is withheld because it could not be read with certainty; never fill it in or estimate it. An empty string means the page prints a blank.`;


// Tool names and descriptions, identical in both systems.
export const LIST_DOCUMENTS_TOOL = 'list_alfa_laval_published_documents';
export const GET_FIGURES_TOOL = 'get_alfa_laval_published_figures';
const AGENT_NOTICE =
  'These are figures as printed by Alfa Laval in the named document, units as printed, not Dolphin measurements, guarantees or ratings; nothing is converted or calculated.';
export const LIST_DOCUMENTS_DESCRIPTION =
  `List the Alfa Laval documents whose printed figures Dolphin Centrifuge offers, with document number, date and the machines each covers: the five MAB "S" technical data sheets (TD S93303E to S93307E, dated 1/73) and the MAPX / MOPX throughput table (MPCO 20-00-02). ${AGENT_NOTICE}`;
export const GET_FIGURES_DESCRIPTION =
  `Return the figures Alfa Laval printed for one machine: sections, rows, columns and values with units as printed, plus the Alfa Laval document number and date. Covers MAB 204, 205, 206, 207 and 209 (also typed as MAB204, MAB-204 or MAB 204S), MAPX 204 and MOPX 205, 207, 209, 210 and 213. ${AGENT_NOTICE} A cell marked "${NOT_OFFERED}" could not be read with certainty and must not be filled in.`;

const squash =(text) => String(text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');

export function isAlfaLavalPublishedData(data) {
  return Boolean(data) && data.schema === ALFA_LAVAL_DATA_SCHEMA && Array.isArray(data.documents) && Array.isArray(data.machines);
}

export function coveredMachines(data) {
  return data.machines.map((machine) => machine.name);
}

function machineName(data, label) {
  return data.machines.find((machine) => machine.model_label === label)?.name ?? label;
}

/** One line naming the Alfa Laval document, its number and its date. */
export function documentSource(doc) {
  const date = doc.document_date ? `dated ${doc.document_date}` : 'date not given';
  return `Alfa Laval, ${doc.title}, ${doc.document_number}, ${date}`;
}

function documentHeader(doc, id = doc.id ?? doc.document) {
  return {
    document: id,
    title: doc.title,
    documentNumber: doc.document_number,
    documentDate: doc.document_date,
    source: documentSource(doc),
  };
}

export function listPublishedDocuments(data) {
  return data.documents.map((doc) => ({
    ...documentHeader(doc),
    machines: doc.machines.map((label) => machineName(data, label)),
  }));
}

/**
 * Accepts the forms people type: "MAB 204", "MAB204", "MAB-204", "mab 204s",
 * "MOPX 207", "Alfa Laval MOPX207". A printed type such as "MAB 204S" maps to its machine.
 */
export function findPublishedMachine(data, text) {
  const query = squash(text).replace(/^alfalaval/, '');
  if (!query) return undefined;
  return data.machines.find((machine) => squash(machine.model_label) === query || squash(machine.name) === query)
    ?? data.machines.find((machine) => machine.printed_type && squash(machine.printed_type) === query);
}

/** Accepts the document id, its title, or a printed number such as "TD S93303E", "S93303E" or "MPCO 20-00-02". */
export function findPublishedDocument(data, text) {
  const query = squash(text);
  if (!query) return undefined;
  return data.documents.find((doc) => {
    const names = [doc.id, doc.id.replace(/^alfa-laval-/, ''), doc.title].map(squash);
    if (names.includes(query)) return true;
    const numbers = String(doc.document_number).split(/;|,|\(supersedes/i).map(squash).filter(Boolean);
    return numbers.some((number) => number === query || (query.length >= 6 && number.endsWith(query)));
  });
}

function machineSummary(machine) {
  return { model: machine.name, modelLabel: machine.model_label, printedType: machine.printed_type };
}

function publicSection(section) {
  return {
    heading: section.heading,
    columns: section.columns,
    units: section.units,
    withheld: section.withheld,
    rows: section.rows.map((row) => {
      const notOffered = Object.keys(row.values).filter((column) => row.values[column] === null);
      return {
        row: row.row,
        values: Object.fromEntries(Object.entries(row.values).map(([column, value]) => [column, value === null ? NOT_OFFERED : value])),
        ...(notOffered.length ? { notOffered } : {}),
      };
    }),
  };
}

export function publicDocumentFigures(doc) {
  return {
    ...documentHeader(doc),
    sections: doc.sections.map(publicSection),
    ...(Array.isArray(doc.statements)
      ? {
          statements: doc.statements.map((statement) => (statement === null ? NOT_OFFERED : statement)),
          statementsWithheld: doc.statements_withheld,
        }
      : {}),
  };
}

/**
 * Status "ok" with the machine's documents, "not_found" for an unknown model (with the
 * covered machines), or "document_not_found" when the named document does not cover it.
 */
export function lookupPublishedFigures(data, { model, document } = {}) {
  const machine = findPublishedMachine(data, model);
  if (!machine) {
    return { status: 'not_found', coveredMachines: coveredMachines(data), documents: listPublishedDocuments(data) };
  }
  let docs = machine.documents;
  if (document !== undefined && document !== null && String(document).trim()) {
    const named = findPublishedDocument(data, document);
    docs = named ? docs.filter((doc) => doc.document === named.id) : [];
    if (!docs.length) {
      return {
        status: 'document_not_found',
        machine: machineSummary(machine),
        documents: machine.documents.map((doc) => documentHeader(doc)),
      };
    }
  }
  return { status: 'ok', machine: machineSummary(machine), documents: docs.map(publicDocumentFigures) };
}
