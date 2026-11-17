import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseConfig, supabaseConfig } from './lib/supabase/env';

export async function proxy(request: NextRequest) {
  if (!hasSupabaseConfig()) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const { url, key } = supabaseConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        for (const [name, value] of Object.entries(headersToSet ?? {})) {
          response.headers.set(name, value);
        }
      }
    }
  });
  // Server verification and token refresh. No local getSession() trust for authorization.
  await supabase.auth.getClaims();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = { matcher: ['/studio/:path*','/api/:path*','/auth/:path*'] };
