import test from 'node:test';
import assert from 'node:assert/strict';
import {favoriteSources} from '../lib/references-v3';

test('all 30 bookmarks have unique ids and project modules',()=>{
  assert.equal(favoriteSources.length,30);
  assert.equal(new Set(favoriteSources.map(s=>s.id)).size,30);
  assert.equal(favoriteSources.filter(s=>s.verification==='reviewed').length,13);
  for(const source of favoriteSources)assert.ok(source.modules.length);
});

test('private deep links and invitation tokens must not be published',()=>{
  for(const source of favoriteSources){
    assert.ok(!source.url || !source.url.includes('invitationToken'));
    assert.ok(!source.url || !source.url.includes('gemini.google.com/share/'));
    if(source.access==='private'||source.access==='invitation')assert.equal(source.url,null);
  }
});
