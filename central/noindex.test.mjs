import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isNoindexPage} from '../config/noindex-registry.mjs';
import {onRequest} from '../functions/central/api/[[path]].js';

test('private Central descendants stay outside sitemaps without hiding public technical pages',()=>{
 for(const path of ['/central','/central/','/central/index.html','/central/reports/example','/central/api/result/id','/admin/submissions','/used-oil/','/404.html'])assert.equal(isNoindexPage(path),true,path);
 for(const path of ['/','/technical-data/catalog.json','/used-oil-centrifuge/','/used-oil-centrifuge-plant/','/centralized-separation/'])assert.equal(isNoindexPage(path),false,path);
});
test('the built sitemap omits registered pages and Central retains HTML and static HTTP noindex',async()=>{
 const root=new URL('../dist/',import.meta.url);
 const sitemap=await readFile(new URL('sitemap-0.xml',root),'utf8');
 for(const [,url] of sitemap.matchAll(/<loc>(.*?)<\/loc>/g))assert.equal(isNoindexPage(url),false,url);
 assert.match(await readFile(new URL('central/index.html',root),'utf8'),/<meta name="robots" content="noindex,nofollow">/);
 assert.match(await readFile(new URL('_headers',root),'utf8'),/\/central\/\*[\s\S]*X-Robots-Tag: noindex, nofollow/);
});
test('Central API success, rejected auth, and upstream failure all carry noindex and no-store',async()=>{
 const original=globalThis.fetch;
 try{for(const status of [200,401,503]){
  globalThis.fetch=async()=>{if(status===503)throw new Error('offline');return new Response('{}',{status});};
  const response=await onRequest({request:new Request('https://dolphincentrifuge.com/central/api/health')});
  assert.equal(response.status,status);assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');assert.equal(response.headers.get('cache-control'),'no-store');
 }}finally{globalThis.fetch=original;}
});
