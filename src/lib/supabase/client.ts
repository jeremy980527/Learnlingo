"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase 尚未設定：請在 .env.local 中設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
