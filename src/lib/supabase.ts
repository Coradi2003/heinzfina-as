import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso no navegador.
 * A publishable key é pública por design (equivalente à antiga anon key).
 * Você pode sobrescrever via env: VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.
 */
export const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ?? "https://adkcbljnfouvnzoeykin.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable_ZOv0JhNBHU5EwG-sg0L4xw_F6U2Z9wz";

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
