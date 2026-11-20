import test from 'node:test';
import assert from 'node:assert/strict';
import {workspaceSchema,projectSchema,patchProjectSchema,documentSchema,detectAllowedMime,assetMimeTypes,maxAssetBytes} from '../lib/validators';

test('workspace and project inputs are bounded and validated',()=>{
  assert.equal(workspaceSchema.safeParse({name:'Meu estúdio'}).success,true);
  assert.equal(workspaceSchema.safeParse({name:'a'}).success,false);
  const draft={workspace_id:'a5c72315-7931-4f78-9233-9054772b2805',title:'Campanha ROD'};
  assert.equal(projectSchema.safeParse(draft).success,true);
  assert.equal(projectSchema.safeParse({...draft,workspace_id:'fake'}).success,false);
  assert.equal(projectSchema.safeParse({...draft,admin:true}).success,false);
  assert.equal(patchProjectSchema.safeParse({}).success,false);
  assert.equal(patchProjectSchema.safeParse({title:'Novo título'}).success,true);
});
test('documents reject extra fields and oversized payload',()=>{
  assert.equal(documentSchema.safeParse({kind:'briefing',payload:{text:'Uma ideia'}}).success,true);
  assert.equal(documentSchema.safeParse({kind:'result',payload:{}}).success,false);
  assert.equal(documentSchema.safeParse({kind:'briefing',payload:{text:'X'.repeat(41000)}}).success,false);
  assert.equal(documentSchema.safeParse({kind:'briefing',payload:{},review_state:'verified'}).success,false);
});
test('asset MIME must match content signature',()=>{
  assert.equal(detectAllowedMime(new Uint8Array([137,80,78,71,13,10,26,10])), 'image/png');
  assert.equal(detectAllowedMime(new Uint8Array([255,216,255,224])), 'image/jpeg');
  assert.equal(detectAllowedMime(new TextEncoder().encode('%PDF-1.4')), 'application/pdf');
  assert.equal(detectAllowedMime(new TextEncoder().encode('RIFF0000WEBP')), 'image/webp');
  assert.equal(detectAllowedMime(new TextEncoder().encode('hello')), null);
  assert.equal(assetMimeTypes.size,4);
  assert.equal(maxAssetBytes,10485760);
});
