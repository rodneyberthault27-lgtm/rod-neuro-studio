-- Fail-fast synthetic RLS tests; run after mock_supabase.sql and Phase 1 migration.
\set ON_ERROR_STOP on
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select public.rod_create_workspace('Workspace A') as wa \gset
insert into public.rod_projects(workspace_id,title,objective,created_by)
values (:'wa'::uuid,'Projeto privado','Pedido',auth.uid()) returning id as pa \gset
select set_config('rod.test.workspace', :'wa', false);
insert into public.rod_documents(workspace_id,project_id,kind,payload,created_by)
values (:'wa'::uuid,:'pa'::uuid,'briefing','{"text":"Rascunho sintético"}',auth.uid());
insert into storage.objects(bucket_id,name)
values('rod-private',:'wa'||'/'||:'pa'||'/file.png');
-- Existing owner can read one project/document
do $$
begin
 if (select count(*) from public.rod_projects) <> 1 then
   raise exception 'Owner cannot read own project';
 end if;
 if (select count(*) from public.rod_documents) <> 1 then
   raise exception 'Owner cannot read own document';
 end if;
end $$;

-- Path is private, tied to its matching workspace and project.
select public.rod_asset_path_allowed(:'wa'||'/'||:'pa'||'/file.png',true) as owner_upload \gset
\if :owner_upload
\else
\echo 'owner upload permission unexpectedly false'
\quit 1
\endif
select public.rod_asset_path_allowed(:'wa'||'/bad-project/file.png',true) as bad_path \gset
\if :bad_path
\echo 'invalid asset path unexpectedly allowed'
\quit 1
\endif

set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
do $$
begin
 if (select count(*) from public.rod_projects) <> 0 then
   raise exception 'Cross-tenant project leaked';
 end if;
 if (select count(*) from public.rod_documents) <> 0 then
   raise exception 'Cross-tenant document leaked';
 end if;
 if (select count(*) from public.rod_workspaces) <> 0 then
   raise exception 'Cross-tenant workspace leaked';
 end if;
end $$;
-- Direct access by unknown member must be rejected.
do $$
begin
 begin
   insert into public.rod_projects(workspace_id,title,created_by)
   values (current_setting('rod.test.workspace')::uuid,'Forbidden project',auth.uid());
   raise exception 'Non-member inserted into workspace';
 exception when insufficient_privilege then null;
 end;
end $$;

-- Give user 2 viewer access to A from privileged admin, not from anonymous code.
reset role;
insert into public.rod_memberships(workspace_id,user_id,role)
values (:'wa'::uuid,'22222222-2222-4222-8222-222222222222','viewer');
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
do $$
begin
 if (select count(*) from public.rod_projects) <> 1 then
   raise exception 'Viewer cannot read shared project';
 end if;
 if (select count(*) from storage.objects) <> 1 then
   raise exception 'Viewer cannot read shared file';
 end if;
end $$;
select public.rod_asset_path_allowed(:'wa'||'/'||:'pa'||'/file.png',false) as viewer_read \gset
\if :viewer_read
\else
\echo 'viewer cannot read asset'
\quit 1
\endif
select public.rod_asset_path_allowed(:'wa'||'/'||:'pa'||'/file.png',true) as viewer_write \gset
\if :viewer_write
\echo 'viewer can write asset'
\quit 1
\endif
do $$
begin
 begin
   insert into public.rod_projects(workspace_id,title,created_by)
   values ((select id from public.rod_workspaces limit 1),'Viewer cannot insert',auth.uid());
   raise exception 'Viewer was allowed to insert';
 exception when insufficient_privilege then null;
 end;
end $$;

-- User 3 has no membership in any workspace.
set request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
do $$
begin
 if (select count(*) from public.rod_assets) <> 0 then
   raise exception 'Unauthorized asset metadata exposed';
 end if;
 if (select count(*) from public.rod_projects) <> 0 then
   raise exception 'Unauthorized projects exposed';
 end if;
end $$;
-- Signatures of role function must not open data to an anonymous caller.
reset role;
set role anon;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
do $$
begin
 begin
   perform public.rod_workspace_role('00000000-0000-4000-8000-000000000000');
   raise exception 'Anonymous was allowed to invoke internal role function';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
\echo 'ROD RLS synthetic smoke checks passed.'
