export async function onRequest(context){
 const path=new URL(context.request.url).pathname;
 const headers=new Headers();
 for(const name of ['content-type','cookie','origin']){const v=context.request.headers.get(name);if(v)headers.set(name,v);}
 const request=new Request('https://dolphin-central.dolphin-centrifuge.workers.dev'+path,{method:context.request.method,headers,body:['GET','HEAD'].includes(context.request.method)?undefined:context.request.body,redirect:'manual'});
 try{return await fetch(request);}catch{return Response.json({error:'Central is temporarily unavailable. Please try again.'},{status:503,headers:{'cache-control':'no-store'}});}
}
