import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/db";
import { processMaterial } from "@/lib/materials/process-material";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "尚未設定 Supabase，無法重新處理。" },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入。" }, { status: 401 });
  }

  const material = await prisma.material.findUnique({ where: { id } });

  if (!material || material.userId !== user.id) {
    return NextResponse.json({ error: "找不到教材。" }, { status: 404 });
  }

  await prisma.material.update({
    where: { id },
    data: { status: "PARSING", errorMessage: null },
  });

  after(() => {
    processMaterial(id).catch((error) => {
      console.error(`[processMaterial:retry] ${id} 失敗:`, error);
    });
  });

  return NextResponse.json({ status: "PARSING" });
}
