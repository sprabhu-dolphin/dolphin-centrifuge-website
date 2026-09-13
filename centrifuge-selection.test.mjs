import test from 'node:test';
import assert from 'node:assert/strict';
import {technicalCatalog as catalog} from './src/data/agentCatalog.mjs';
import {models} from './src/data/centrifugeSpecs.ts';
import {selectCentrifugeCandidates as select} from './src/lib/centrifugeSelection.mjs';
import {getCentrifugeSpecifications as specs, getCentrifugeCapacity as capacity} from './src/lib/agentCatalogQuery.mjs';

test('10 US GPM diesel yields separate manual and self-cleaning candidates with conditions', () => {
  for (const [cleaning,id,lph] of [['manual','alfa-laval-mab-204',2900],['self-cleaning','alfa-laval-mopx-205',3300]]) {
    const result = select(catalog,{application:'diesel',requiredFlow:10,flowUnit:'US GPM',cleaning});
    assert.equal(result.candidate.modelId,id);
    assert.equal(result.candidate.capacity.value,lph);
    assert.equal(result.candidate.conditions.viscosity.value,13);
    assert.equal(result.candidate.conditions.centrifugationTemperatureC,40);
    assert.equal(result.canRecommendPurchase,false);
    assert.ok(result.missingInputs.includes('solids loading'));
    assert.equal(select(catalog,{application:'diesel',requiredFlow:2271.24707,flowUnit:'L/h',cleaning}).candidate.modelId,id);
  }
});
test('selection cannot substitute another fluid, a hydraulic ceiling, or the top of a capacity range', () => {
  for(const application of ['water','wastewater','black diesel','diesel emulsified with coolant','marine diesel containing coolant']) {
    assert.equal(select(catalog,{application,requiredFlow:10,flowUnit:'US GPM'}).status,'no_documented_match');
  }
  assert.equal(select(catalog,{application:'diesel',requiredFlow:10,flowUnit:'US GPM',temperatureC:10}).status,'no_documented_match');
  assert.equal(select(catalog,{application:'diesel',requiredFlow:10,flowUnit:'US GPM',viscosityCst:13.5}).status,'no_documented_match');
  assert.equal(select(catalog,{application:'diesel',requiredFlow:10,flowUnit:'US GPM',viscosityCst:13,viscosityReferenceTemperatureC:98}).status,'no_documented_match');
  const clone=structuredClone(catalog);
  clone.models=clone.models.filter(m=>m.id==='alfa-laval-mab-204');
  clone.models[0].capacities=clone.models[0].capacities.filter(c=>c.fluid.name.toLowerCase().includes('diesel'));
  clone.models[0].capacities[0].sourceValue={minimum:1000,maximum:5000,unit:'L/h'};
  assert.equal(select(clone,{application:'diesel',requiredFlow:2000,flowUnit:'L/h'}).status,'no_documented_match');
});
test('pump-specific motor values cannot be collapsed or borrowed from another machine', () => {
  const unknown=specs(catalog,{model:'MAB 206',field:'motorPower'});
  assert.equal(unknown.data.specifications.motorPower.value,undefined);
  assert.equal(unknown.data.specifications.motorPower.status,'requires_configuration');
  const bare=specs(catalog,{model:'DMB-028',configurationId:'alfa-laval-mab-206-without-oem-pump',field:'motorPower'});
  assert.equal(bare.data.specifications.motorPower.value,5.5);
  assert.equal(bare.data.specifications.motorPower.unit,'kW');
  const pump=specs(catalog,{model:'MAB 206',configurationId:'alfa-laval-mab-206-with-oem-pump',field:'motorPower'});
  assert.equal(pump.data.specifications.motorPower.minimum,11);
  assert.equal(pump.data.specifications.motorPower.maximum,13);
  assert.equal(specs(catalog,{model:'MAB 104',configurationId:'alfa-laval-mab-206-with-oem-pump'}).status,'invalid_input');
  // Field filtering must not mutate the catalog shared by future calls.
  assert.ok(specs(catalog,{model:'MAB 206'}).data.specifications.sludgeSpace);
});
test('published mechanical records and agent records agree and retain assembly/frequency scope', () => {
  for(const model of models) {
    const record=catalog.models.find(m=>m.id===model.id);
    for(const [field,key] of [['bowlSpeedRpm','bowlSpeed'],['netWeightLb','netWeight'],['motorHp','motorPower']]) {
      if(model[field]===undefined) continue;
      let fact=record.specifications[key];
      if(fact.status==='requires_configuration') fact=fact.publishedNominalDrive;
      assert.deepEqual(fact.value ?? [fact.minimum,fact.maximum],model[field],`${model.id} ${field}`);
    }
  }
  const rpm=specs(catalog,{model:'Alfa Laval MAB 104 B 24-60',field:'bowlSpeed'}).data.specifications.bowlSpeed;
  assert.equal(rpm.value,7350);
  assert.equal(rpm.frequencyHz,60);
  assert.deepEqual(rpm.alternatives.map(r=>[r.frequencyHz,r.value]),[[50,7500],[60,7350]]);
});
test('decimal viscosity in a natural-language request is not silently truncated', () => {
  assert.equal(capacity(catalog,{model:'MAB 204',fluid:'diesel 13.5 cSt'}).status,'not_found');
  assert.equal(capacity(catalog,{model:'MAB 204',fluid:'diesel 13 cSt at 40 C'}).status,'ok');
});
