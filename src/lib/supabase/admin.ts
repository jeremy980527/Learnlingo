import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

const MATERIALS_BUCKET = "materials";

export function isSupabaseAdminConfigured() {
  return Boolean(supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * 僅供伺服器端背景工作使用（例如處理教材上傳後的解析流程），
 * 使用 Service Role Key 繞過 RLS，絕對不可以暴露給前端。
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase Admin 尚未設定：請在伺服器環境變數中設定 SUPABASE_SERVICE_ROLE_KEY。",
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export { MATERIALS_BUCKET };
