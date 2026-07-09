import { randomUUID } from "node:crypto";
import { NextResponse, after } from "next/server";
import { ensureUserRecord } from "@/lib/auth/ensure-user-record";
import { processMaterial } from "@/lib/materials/process-material";
import { prisma } from "@/lib/db";
import { ACCEPTED_MIME_TYPES, isSupportedFileType } from "@/lib/parsing";
import { createClient } from "@/lib/supabase/server";
import { MATERIALS_BUCKET } from "@/lib/supabase/admin";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "尚未設定 Supabase，無法處理上傳。" },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入。" }, { status: 401 });
  }

  await ensureUserRecord(user);

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少上傳檔案。" }, { status: 400 });
  }

  if (!isSupportedFileType(file.type)) {
    return NextResponse.json(
      {
        error: `不支援的檔案格式，請上傳 ${ACCEPTED_MIME_TYPES.join(", ")} 其中一種。`,
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "檔案大小不可超過 15MB。" },
      { status: 400 },
    );
  }

  const objectPath = `${user.id}/${randomUUID()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `檔案上傳失敗：${uploadError.message}` },
      { status: 500 },
    );
  }

  const material = await prisma.material.create({
    data: {
      userId: user.id,
      filename: file.name,
      fileType: file.type,
      storagePath: objectPath,
      status: "UPLOADING",
    },
  });

  after(() => {
    processMaterial(material.id).catch((error) => {
      console.error(`[processMaterial] ${material.id} 失敗:`, error);
    });
  });

  return NextResponse.json({ materialId: material.id }, { status: 201 });
}
