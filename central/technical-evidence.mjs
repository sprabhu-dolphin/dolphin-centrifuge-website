import {technicalCatalog} from '../src/data/centrifugeTechnicalRegistry.mjs';

const normalize=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
// Always carry complete current records, including conditions, into an answer
// about a named model. Search snippets can otherwise split a rating from its basis.
export function technicalEvidence(question,context,evidence){
 const text=normalize([question,context,...evidence.map(d=>d.title+' '+d.text)].join(' '));
 const selected=technicalCatalog.models.filter(m=>[m.displayName,...m.aliases||[]].some(alias=>normalize(alias).length>=6&&text.includes(normalize(alias))));
 const ids=new Set(selected.flatMap(m=>[m.id,...m.baseMachineVariantIds||[]]));
 return technicalCatalog.models.filter(m=>ids.has(m.id)).slice(0,8).map(m=>({
  id:'current-catalog:'+m.id,title:m.displayName,heading:'Current complete technical record',kind:'catalog',date:technicalCatalog.reviewedOn||null,url:m.canonicalPage,
  text:JSON.stringify({id:m.id,recordType:m.recordType,baseMachineVariantIds:m.baseMachineVariantIds,requiresBaseModelSelection:m.requiresBaseModelSelection,specifications:m.specifications,capacities:m.capacities,capacityRule:m.capacityRule,interpretation:'This complete current record takes precedence over historical email summaries and website prose for ratings. Every capacity retains its fluid and operating conditions. A commercial package standard motor rating does not identify a pump-equipped versus pump-free OEM variant. If the requested pump configuration is not explicitly mapped, omit its horsepower from customer wording and confirm the build record.'})
 }));
}
