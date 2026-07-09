import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "尚未設定 Supabase，無法查詢狀態。" },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入。" }, { status: 401 });
  }

  const material = await prisma.material.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      errorMessage: true,
      filename: true,
      _count: { select: { units: true } },
    },
  });

  if (!material || material.userId !== user.id) {
    return NextResponse.json({ error: "找不到教材。" }, { status: 404 });
  }

  return NextResponse.json({
    id: material.id,
    filename: material.filename,
    status: material.status,
    errorMessage: material.errorMessage,
    unitCount: material._count.units,
  });
}
