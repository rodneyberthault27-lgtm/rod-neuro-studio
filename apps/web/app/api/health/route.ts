import { json } from '@/lib/api';
import { hasSupabaseConfig } from '@/lib/supabase/env';
export const dynamic = 'force-dynamic';
export async function GET() {
  return json({service:'rod-neuro-studio-v3',configured:hasSupabaseConfig(),status:'phase1'});
}
