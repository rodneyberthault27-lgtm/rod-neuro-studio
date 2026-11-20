-- Synthetic Supabase subset for SQL verification in a disposable PostgreSQL database.
-- NO real user data, accounts, credentials or production connections.
create schema auth;
create schema storage;
create role authenticated nologin;
create role anon nologin;
create table auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid
$$;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  name text not null unique
);
alter table storage.objects enable row level security;
grant usage on schema public, auth, storage to authenticated;
grant execute on function auth.uid() to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
insert into auth.users(id) values
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222'),
 ('33333333-3333-4333-8333-333333333333');
