import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase 尚未設定：請在 .env.local 中設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component 呼叫 setAll 會被忽略，
          // Session 刷新已由 proxy.ts 處理，這裡可安全忽略。
        }
      },
    },
  });
}
