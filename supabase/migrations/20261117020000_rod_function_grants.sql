-- ROD Neuro Studio v3 | Fase 1.2: corrigir grants explícitos do Supabase.
-- Apenas homologação; aplicar depois das duas migrações anteriores.
-- RLS deve continuar usando helpers como usuário autenticado.
-- REVOKE FROM PUBLIC não desfaz GRANT explícito a anon.
REVOKE EXECUTE ON FUNCTION public.rod_workspace_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rod_asset_path_allowed(text, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rod_create_workspace(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rod_touch_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.rod_workspace_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rod_asset_path_allowed(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rod_create_workspace(text) TO authenticated;
