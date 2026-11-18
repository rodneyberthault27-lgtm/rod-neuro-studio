-- ROD Neuro Studio 3.0 | Fase 1.1: hardening antes de homologação.
-- Executar DEPOIS de 20261117000000_rod_v3.sql, somente em ambiente isolado.
-- Sem dados ou contas reais envolvidos no teste automatizado.

-- Segurança de identidade: usuários autenticados não podem mover um projeto para
-- outra organização, mudar a autoria, o ID, as datas ou o estado experimental.
revoke update on public.rod_projects from authenticated;
grant update (title, objective, audience, channel)
  on public.rod_projects to authenticated;

-- O caminho do arquivo deve corresponder exatamente a workspace/projeto/UUID gerado.
-- O app envia <workspace UUID>/<project UUID>/<asset UUID>.<ext>.
alter table public.rod_assets
  add constraint rod_assets_path_scoped check (
    split_part(storage_key, '/', 1) = workspace_id::text
    and split_part(storage_key, '/', 2) = project_id::text
    and split_part(storage_key, '/', 4) = ''
    and split_part(storage_key, '/', 3) ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp|pdf)$'
  );

-- O cliente também pode acessar o Storage diretamente; a política do bucket
-- deve validar o mesmo padrão, independentemente da API do Next.js.
create or replace function public.rod_asset_path_allowed(
  p_path text, p_write boolean default false
) returns boolean language plpgsql stable security definer
set search_path = public, pg_temp as $$
declare
  parts text[] := string_to_array(p_path, '/');
  ws uuid; pj uuid; membership text;
begin
  if array_length(parts,1) <> 3 then return false; end if;
  if parts[3] is null or parts[3] !~*
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp|pdf)$'
  then return false; end if;
  begin
    ws := parts[1]::uuid;
    pj := parts[2]::uuid;
  exception when invalid_text_representation then return false; end;
  if not exists(
    select 1 from public.rod_projects
      where workspace_id = ws and id = pj
  ) then return false; end if;
  membership := public.rod_workspace_role(ws);
  return case when p_write
    then membership in ('owner','editor')
    else membership is not null end;
end
$$;
revoke all on function public.rod_asset_path_allowed(text,boolean) from public;
grant execute on function public.rod_asset_path_allowed(text,boolean) to authenticated;

-- Permissões de escrita em documents são append-only, sem update nem delete.
-- Os demais papéis de Storage ficam regulados por RLS.
