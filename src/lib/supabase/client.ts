import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createSupabaseClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}