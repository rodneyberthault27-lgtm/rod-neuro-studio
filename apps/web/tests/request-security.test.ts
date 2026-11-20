import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyMutationOrigin} from '../lib/request-security';

function req(origin:string|null, site?:string, url='https://studio-preview.example.com/api/projects'){
  const headers = new Headers();
  if(origin !== null) headers.set('origin',origin);
  if(site) headers.set('sec-fetch-site',site);
  return new Request(url,{method:'POST',headers});
}
test('allow browser mutations from exact deployment origin',()=>{
  assert.equal(verifyMutationOrigin(req('https://studio-preview.example.com','same-origin')),true);
  assert.equal(verifyMutationOrigin(req('https://studio-preview.example.com','same-site')),true);
  assert.equal(verifyMutationOrigin(req('http://localhost:3000','same-origin','http://localhost:3000/api/workspaces')),true);
});
test('reject absent, invalid, foreign, misleading and http production origins',()=>{
  assert.equal(verifyMutationOrigin(req(null)),false);
  assert.equal(verifyMutationOrigin(req('null')),false);
  assert.equal(verifyMutationOrigin(req('https://other.example.com')),false);
  assert.equal(verifyMutationOrigin(req('https://sub.studio-preview.example.com')),false);
  assert.equal(verifyMutationOrigin(req('http://studio-preview.example.com')),false);
  assert.equal(verifyMutationOrigin(req('https://studio-preview.example.com.evil.test')),false);
  assert.equal(verifyMutationOrigin(req('https://studio-preview.example.com/other')),false);
  assert.equal(verifyMutationOrigin(req('%')),false);
  assert.equal(verifyMutationOrigin(req('https://studio-preview.example.com','cross-site')),false);
});
test('protect every state-changing authenticated API route',()=>{
  const routes=[
    '../app/api/workspaces/route.ts',
    '../app/api/projects/route.ts',
    '../app/api/projects/[id]/route.ts',
    '../app/api/projects/[id]/documents/route.ts',
    '../app/api/projects/[id]/assets/route.ts',
    '../app/api/auth/signout/route.ts'
  ];
  for(const path of routes){
    const content=readFileSync(new URL(path,import.meta.url),'utf8');
    assert.match(content,/verifyMutationOrigin\(request\)/,path);
    assert.match(content,/if\(!verifyMutationOrigin\(request\)\) return json/,path);
  }
});
