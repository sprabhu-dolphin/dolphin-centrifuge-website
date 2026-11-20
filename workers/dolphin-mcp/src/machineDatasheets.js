// The machine data sheet record, bundled at build time from the same public file the website serves
// (public/technical-data/machine-datasheets.v1.json), so the Worker and the site cannot disagree.
// Matching and answers come from the one shared module used by the page WebMCP tools as well.
import data from '../../../public/technical-data/machine-datasheets.v1.json' with { type: 'json' };
import { getMachineDatasheet, listMachines } from '../../../src/lib/machineDatasheets.mjs';

export const machineDatasheetData = data;
export const getMachineDatasheetTool = (args) => getMachineDatasheet(data, args);
export const listMachinesTool = (args) => listMachines(data, args);
