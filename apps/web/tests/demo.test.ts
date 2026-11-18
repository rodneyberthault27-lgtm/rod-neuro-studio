import test from 'node:test';
import assert from 'node:assert/strict';
import {demoProject,demoBriefing} from '../lib/demo';
import {projectSchema,documentSchema} from '../lib/validators';

test('demo project passes the same input schema as the API',()=>{
  const input={workspace_id:'a5c72315-7931-4f78-9233-9054772b2805',...demoProject};
  assert.equal(projectSchema.safeParse(input).success,true);
  assert.match(demoProject.title,/DEMO/);
});

test('demo document is a draft and does not assert observed outcomes',()=>{
  assert.equal(documentSchema.safeParse(demoBriefing).success,true);
  assert.equal(demoBriefing.kind,'briefing');
  assert.equal(demoBriefing.payload.source,'synthetic_demo');
  assert.match(demoBriefing.payload.text,/Nenhum efeito foi medido/);
  assert.equal('review_state' in demoBriefing,false);
});
