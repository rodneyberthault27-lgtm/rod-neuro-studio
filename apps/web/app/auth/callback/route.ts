import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig } from '@/lib/supabase/env';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest) {
  const url=new URL(request.url);
  const code=url.searchParams.get('code');
  const candidate=url.searchParams.get('next') || '/studio';
  const next=(candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes('\\'))
    ? candidate : '/studio';
  if(code && hasSupabaseConfig()) {
    const db=await createClient();
    const {error}=await db.auth.exchangeCodeForSession(code);
    if(!error) return NextResponse.redirect(new URL(next,request.url),{headers:{'Cache-Control':'private, no-store'}});
  }
  return NextResponse.redirect(new URL('/login?error=callback',request.url));
}
