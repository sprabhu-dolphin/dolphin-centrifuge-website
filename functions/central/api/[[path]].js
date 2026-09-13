export async function onRequest(context){
 const url=new URL(context.request.url),path=url.pathname+url.search;
 const headers=new Headers();
 for(const name of ['content-type','cookie','origin']){const v=context.request.headers.get(name);if(v)headers.set(name,v);}
 const request=new Request('https://dolphin-central.dolphin-centrifuge.workers.dev'+path,{method:context.request.method,headers,body:['GET','HEAD'].includes(context.request.method)?undefined:context.request.body,redirect:'manual'});
 let response;
 try{response=await fetch(request);}catch{response=Response.json({error:'Central is temporarily unavailable. Please try again.'},{status:503});}
 // Pages _headers rules do not apply to Function responses, including errors.
 const result=new Response(response.body,response);
 result.headers.set('cache-control','no-store');
 result.headers.set('x-robots-tag','noindex, nofollow');
 return result;
}
