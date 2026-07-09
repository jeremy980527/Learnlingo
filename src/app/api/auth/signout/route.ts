import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase 未設定時視為已登出，不阻擋流程
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
