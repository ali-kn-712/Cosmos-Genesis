// Supabase client for the static GitHub Pages app.
// The publishable key is intended for browser use. Protect data with RLS;
// never put a service_role/secret key in this file.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://bpkramxvhjpfafrnnmzp.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7yXHZYU-xWRAWhCEianNag_V9dg_svC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
