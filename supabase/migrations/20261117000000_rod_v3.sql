-- ROD Neuro Studio 3.0 | Phase 1
-- Run only on a separate Supabase project after reviewing policies and backup.
-- Supabase Auth is the identity provider. The browser NEVER uses a service-role key.
create extension if not exists pgcrypto;

create table if not exists public.rod_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  owner_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.rod_memberships (
  workspace_id uuid not null references public.rod_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);
create table if not exists public.rod_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rod_workspaces(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 180),
  objective text not null default '',
  audience text not null default '',
  channel text not null default '',
  status text not null default 'briefing' check (status in ('briefing','analysis','creative','testing','complete','archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,id)
);
create table if not exists public.rod_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rod_workspaces(id) on delete cascade,
  project_id uuid not null,
  kind text not null check (kind in ('briefing','analysis','creative_version','experiment','learning')),
  revision integer not null default 1 check (revision>0),
  payload jsonb not null check (jsonb_typeof(payload)='object'),
  review_state text not null default 'draft' check (review_state in ('draft','needs_review','verified')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(workspace_id,id),
  foreign key(workspace_id,project_id) references public.rod_projects(workspace_id,id) on delete cascade
);
create table if not exists public.rod_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rod_workspaces(id) on delete cascade,
  project_id uuid not null,
  storage_key text not null unique,
  original_name text not null,
  mime_type text not null check(mime_type in ('image/png','image/jpeg','image/webp','application/pdf')),
  byte_size integer not null check(byte_size>0 and byte_size<=10485760),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(workspace_id,id),
  foreign key(workspace_id,project_id) references public.rod_projects(workspace_id,id) on delete cascade
);
create table if not exists public.rod_import_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rod_workspaces(id) on delete cascade,
  state text not null default 'staged' check(state in ('staged','review','ready','applied','rolled_back','failed')),
  manifest jsonb not null default '{}'::jsonb,
  input_sha256 text not null check(input_sha256 ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.rod_workspace_role(p_workspace_id uuid)
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select m.role from public.rod_memberships m
  where m.workspace_id = p_workspace_id and m.user_id = (select auth.uid())
  limit 1
$$;
revoke all on function public.rod_workspace_role(uuid) from public;
grant execute on function public.rod_workspace_role(uuid) to authenticated;

create or replace function public.rod_create_workspace(p_name text)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_user uuid := auth.uid(); v_name text := trim(p_name);
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_name is null or length(v_name)<2 or length(v_name)>120 then
    raise exception 'Invalid workspace name';
  end if;
  insert into public.rod_workspaces (name,owner_user_id) values(v_name,v_user) returning id into v_id;
  insert into public.rod_memberships (workspace_id,user_id,role) values (v_id,v_user,'owner');
  return v_id;
end
$$;
revoke all on function public.rod_create_workspace(text) from public;
grant execute on function public.rod_create_workspace(text) to authenticated;

create or replace function public.rod_touch_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at := now(); return new; end
$$;
drop trigger if exists rod_projects_updated on public.rod_projects;
create trigger rod_projects_updated before update on public.rod_projects
for each row execute function public.rod_touch_updated_at();

-- Restricted RLS, including import metadata.
alter table public.rod_workspaces enable row level security;
alter table public.rod_memberships enable row level security;
alter table public.rod_projects enable row level security;
alter table public.rod_documents enable row level security;
alter table public.rod_assets enable row level security;
alter table public.rod_import_runs enable row level security;

drop policy if exists rod_workspaces_read on public.rod_workspaces;
create policy rod_workspaces_read on public.rod_workspaces for select to authenticated
using (public.rod_workspace_role(id) is not null);
drop policy if exists rod_memberships_read on public.rod_memberships;
create policy rod_memberships_read on public.rod_memberships for select to authenticated
using (public.rod_workspace_role(workspace_id) is not null);

drop policy if exists rod_projects_read on public.rod_projects;
create policy rod_projects_read on public.rod_projects for select to authenticated
using (public.rod_workspace_role(workspace_id) is not null);
drop policy if exists rod_projects_create on public.rod_projects;
create policy rod_projects_create on public.rod_projects for insert to authenticated
with check (
  created_by=(select auth.uid()) and
  public.rod_workspace_role(workspace_id) in ('owner','editor')
);
drop policy if exists rod_projects_edit on public.rod_projects;
create policy rod_projects_edit on public.rod_projects for update to authenticated
using (public.rod_workspace_role(workspace_id) in ('owner','editor'))
with check (public.rod_workspace_role(workspace_id) in ('owner','editor'));

drop policy if exists rod_documents_read on public.rod_documents;
create policy rod_documents_read on public.rod_documents for select to authenticated
using (public.rod_workspace_role(workspace_id) is not null);
drop policy if exists rod_documents_create on public.rod_documents;
create policy rod_documents_create on public.rod_documents for insert to authenticated
with check (
 created_by=(select auth.uid()) and review_state='draft' and
 public.rod_workspace_role(workspace_id) in ('owner','editor')
);
-- Immutable revisions: no update or delete policies on documents.
drop policy if exists rod_assets_read on public.rod_assets;
create policy rod_assets_read on public.rod_assets for select to authenticated
using (public.rod_workspace_role(workspace_id) is not null);
drop policy if exists rod_assets_create on public.rod_assets;
create policy rod_assets_create on public.rod_assets for insert to authenticated
with check (created_by=(select auth.uid()) and public.rod_workspace_role(workspace_id) in ('owner','editor'));
drop policy if exists rod_assets_delete on public.rod_assets;
create policy rod_assets_delete on public.rod_assets for delete to authenticated
using (public.rod_workspace_role(workspace_id) in ('owner','editor'));
drop policy if exists rod_import_runs_read on public.rod_import_runs;
create policy rod_import_runs_read on public.rod_import_runs for select to authenticated
using (public.rod_workspace_role(workspace_id) in ('owner','editor'));

revoke all on public.rod_workspaces, public.rod_memberships,
 public.rod_projects, public.rod_documents, public.rod_assets, public.rod_import_runs from anon;
grant select on public.rod_workspaces, public.rod_memberships to authenticated;
grant select,insert,update on public.rod_projects to authenticated;
grant select,insert on public.rod_documents to authenticated;
grant select,insert,delete on public.rod_assets to authenticated;
grant select on public.rod_import_runs to authenticated;

-- A restricted PRIVATE bucket. Upload policy validates the workspace/project pair.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('rod-private','rod-private',false,10485760, array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do nothing;

create or replace function public.rod_asset_path_allowed(p_path text, p_write boolean default false)
returns boolean language plpgsql stable security definer set search_path = public, pg_temp as $$
declare p text[] := string_to_array(p_path,'/'); ws uuid; pj uuid; r text;
begin
  if array_length(p,1) <> 3 then return false; end if;
  if p[3] is null or length(p[3])<5 or length(p[3])>160 then return false; end if;
  begin ws := p[1]::uuid; pj := p[2]::uuid;
  exception when invalid_text_representation then return false; end;
  if not exists(select 1 from public.rod_projects where id=pj and workspace_id=ws) then return false; end if;
  r := public.rod_workspace_role(ws);
  return case when p_write then r in ('owner','editor') else r is not null end;
end
$$;
revoke all on function public.rod_asset_path_allowed(text,boolean) from public;
grant execute on function public.rod_asset_path_allowed(text,boolean) to authenticated;

drop policy if exists rod_private_read on storage.objects;
create policy rod_private_read on storage.objects for select to authenticated
using (bucket_id='rod-private' and public.rod_asset_path_allowed(name,false));
drop policy if exists rod_private_insert on storage.objects;
create policy rod_private_insert on storage.objects for insert to authenticated
with check(bucket_id='rod-private' and public.rod_asset_path_allowed(name,true));
drop policy if exists rod_private_delete on storage.objects;
create policy rod_private_delete on storage.objects for delete to authenticated
using(bucket_id='rod-private' and public.rod_asset_path_allowed(name,true));

-- The web application uses only the publishable key with per-user JWT.
-- Never expose service_role or override RLS in browser code.
