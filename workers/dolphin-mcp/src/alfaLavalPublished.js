// Read-only tools for the figures Alfa Laval printed in six selected documents.
// The dataset is bundled at build time from the same file the website serves at
// /technical-data/alfa-laval-published-data.v1.json, so the two can never disagree.
import publishedData from '../../../src/data/alfa-laval-published-data.v1.json' with { type: 'json' };
import {
  ALFA_LAVAL_DATA_URL, FIGURES_STATEMENT, READING_NOTE,
  listPublishedDocuments, lookupPublishedFigures,
} from '../../../src/lib/alfaLavalPublishedData.mjs';
import { CONTACT, SITE } from './catalog.js';

export const PUBLISHED_ATTRIBUTION =
  `Figures: Alfa Laval, as printed in the document named with each figure. Offered by Dolphin Centrifuge, Warren, Michigan (${SITE}). ` +
  'Dolphin is an independent remanufacturer of Alfa Laval centrifuges and is not affiliated with Alfa Laval.';

export function listAlfaLavalPublishedDocuments() {
  const documents = listPublishedDocuments(publishedData);
  return {
    count: documents.length,
    maker: publishedData.maker,
    basis: publishedData.basis,
    usage: FIGURES_STATEMENT,
    documents,
    dataset: ALFA_LAVAL_DATA_URL,
    attribution: PUBLISHED_ATTRIBUTION,
  };
}

export function getAlfaLavalPublishedFigures({ model, document } = {}) {
  if (!model || !String(model).trim()) return { error: 'Provide model, e.g. "MAB 204" or "MOPX 207".' };
  const found = lookupPublishedFigures(publishedData, { model, document });
  if (found.status === 'not_found') {
    return {
      found: 0,
      message: `No Alfa Laval published figures for "${model}". Covered machines: ${found.coveredMachines.join(', ')}. For other models use get_centrifuge_specs or ask Dolphin: ${CONTACT.phone}, ${CONTACT.email}.`,
      coveredMachines: found.coveredMachines,
      documents: found.documents,
      attribution: PUBLISHED_ATTRIBUTION,
    };
  }
  if (found.status === 'document_not_found') {
    return {
      found: 0,
      machine: found.machine,
      message: `The named document does not cover ${found.machine.model}. Documents that do: ${found.documents.map((doc) => doc.documentNumber).join('; ')}.`,
      documents: found.documents,
      attribution: PUBLISHED_ATTRIBUTION,
    };
  }
  return {
    found: 1,
    machine: found.machine,
    maker: publishedData.maker,
    basis: publishedData.basis,
    usage: FIGURES_STATEMENT,
    reading: READING_NOTE,
    documents: found.documents,
    dataset: ALFA_LAVAL_DATA_URL,
    attribution: PUBLISHED_ATTRIBUTION,
  };
}
