import { NextResponse } from 'next/server';
import { createClient } from './supabase/server';
import { hasSupabaseConfig } from './supabase/env';
import type { User } from '@supabase/supabase-js';

export function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, {status, headers:{'Cache-Control':'private, no-store'}});
}
export async function withUser(): Promise<
  {ok:true, db:Awaited<ReturnType<typeof createClient>>, user:User}|
  {ok:false, response:NextResponse}
> {
  if (!hasSupabaseConfig()) return {ok:false,response:json({error:'Configuração Supabase pendente.'},503)};
  const db = await createClient();
  // getUser() calls Auth server instead of trusting a browser cookie.
  const {data:{user},error}=await db.auth.getUser();
  if(error || !user) return {ok:false,response:json({error:'Autenticação necessária.'},401)};
  return {ok:true, db, user};
}
export async function readJson(request:Request, maxBytes = 50000):Promise<unknown> {
  const raw = await request.text();
  if(raw.length > maxBytes) throw new Error('BODY_TOO_LARGE');
  return JSON.parse(raw);
}
export async function readProject(db:Awaited<ReturnType<typeof createClient>>,id:string) {
  return db.from('rod_projects').select('id,workspace_id,title,objective,audience,channel,status,created_at,updated_at').eq('id',id).maybeSingle();
}
