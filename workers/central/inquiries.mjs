// Customer-entered fields only. The contact-form database remains the source of truth.
const summaryFields='id, created_at, first_name, last_name, company, country, us_state, fluid_type, form_type';
const detailFields=summaryFields+', email, phone, contact_method, capacity, solids_percentage, centrifuge_condition, additional_details, parts_json';
const us="upper(trim(country)) IN ('US','USA','UNITED STATES','UNITED STATES OF AMERICA')";
export async function readInquiries(url,db){
 if(!db)return {status:503,data:{error:'The inquiry list is temporarily unavailable.'}};
 const id=url.searchParams.get('id');
 if(id!==null){
  if(!/^[1-9]\d{0,14}$/.test(id))return {status:400,data:{error:'Choose a valid inquiry.'}};
  const inquiry=await db.prepare(`SELECT ${detailFields} FROM submissions WHERE deleted = 0 AND id = ?`).bind(Number(id)).first();
  return inquiry?{data:{inquiry}}:{status:404,data:{error:'This inquiry is no longer available.'}};
 }
 const region=url.searchParams.get('region')||'us',before=url.searchParams.get('before');
 if(!['us','all'].includes(region)||(before!==null&&!/^[1-9]\d{0,14}$/.test(before)))return {status:400,data:{error:'Choose a valid inquiry filter.'}};
 const filters=['deleted = 0'];if(region==='us')filters.push(us);if(before)filters.push('id < ?');
 let query=db.prepare(`SELECT ${summaryFields} FROM submissions WHERE ${filters.join(' AND ')} ORDER BY id DESC LIMIT 26`);
 if(before)query=query.bind(Number(before));
 const {results}=await query.all(),items=results.slice(0,25);
 return {data:{items,nextBefore:results.length>25?items.at(-1).id:null,region,readAt:new Date().toISOString()}};
}
