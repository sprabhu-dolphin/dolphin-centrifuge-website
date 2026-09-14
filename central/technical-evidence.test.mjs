import test from 'node:test';
import assert from 'node:assert/strict';
import {technicalEvidence} from './technical-evidence.mjs';
test('commercial class evidence expands into complete distinct OEM ratings and conditions',()=>{
 const rows=technicalEvidence('DMPX-014 for diesel at 10 GPM','',[]);
 const records=rows.map(r=>JSON.parse(r.text));
 const mopx=records.find(r=>r.id==='alfa-laval-mopx-205'),whpx=records.find(r=>r.id==='alfa-laval-whpx-405');
 assert.ok(mopx&&whpx);
 const rating=mopx.capacities.find(c=>c.fluid.category==='diesel');
 assert.equal(rating.sourceValue.value,3300);
 assert.equal(rating.conditions.centrifugationTemperatureC,40);
 assert.equal(rating.conditions.viscosity.value,13);
 assert.equal(records.find(r=>r.id==='dolphin-dmpx-014').requiresBaseModelSelection,true);
 assert.deepEqual(technicalEvidence('Please acknowledge the paused project','',[]),[]);
});
