import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    } catch {
      // 落入下方的錯誤導向
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=無法完成登入驗證，請再試一次`,
  );
}
