import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserRecord } from "@/lib/auth/ensure-user-record";
import { prisma } from "@/lib/db";
import { computeNextStreak } from "@/lib/game/streak";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  stars: z.number().int().min(0).max(3),
  correctCount: z.number().int().min(0),
  totalCount: z.number().int().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { error: "尚未設定 Supabase，無法儲存進度。" },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入。" }, { status: 401 });
  }

  const parsedBody = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "請求格式錯誤。" }, { status: 400 });
  }
  const { stars, correctCount } = parsedBody.data;

  await ensureUserRecord(user);

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { unit: { include: { material: true } } },
  });

  if (!lesson || lesson.unit.material.userId !== user.id) {
    return NextResponse.json({ error: "找不到關卡。" }, { status: 404 });
  }

  const nextLessonInSameUnit = await prisma.lesson.findFirst({
    where: { unitId: lesson.unitId, order: lesson.order + 1 },
  });

  const nextLesson =
    nextLessonInSameUnit ??
    (await prisma.lesson.findFirst({
      where: {
        unit: {
          materialId: lesson.unit.materialId,
          order: lesson.unit.order + 1,
        },
        order: 0,
      },
    }));

  const result = await prisma.$transaction(async (tx) => {
    const existingProgress = await tx.userProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    });

    await tx.userProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: {
        status: "COMPLETED",
        stars: Math.max(existingProgress?.stars ?? 0, stars),
        bestScore: Math.max(existingProgress?.bestScore ?? 0, correctCount),
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        status: "COMPLETED",
        stars,
        bestScore: correctCount,
        completedAt: new Date(),
      },
    });

    if (nextLesson) {
      const nextProgress = await tx.userProgress.findUnique({
        where: { userId_lessonId: { userId: user.id, lessonId: nextLesson.id } },
      });

      if (!nextProgress) {
        await tx.userProgress.create({
          data: { userId: user.id, lessonId: nextLesson.id, status: "AVAILABLE" },
        });
      } else if (nextProgress.status === "LOCKED") {
        await tx.userProgress.update({
          where: { userId_lessonId: { userId: user.id, lessonId: nextLesson.id } },
          data: { status: "AVAILABLE" },
        });
      }
    }

    await tx.xpLog.create({
      data: { userId: user.id, delta: lesson.xpReward, source: `lesson:${lesson.id}` },
    });

    const currentUser = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
    const now = new Date();
    const nextStreakDays = computeNextStreak(
      currentUser.lastActiveAt,
      currentUser.streakDays,
      now,
    );

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        xpTotal: { increment: lesson.xpReward },
        streakDays: nextStreakDays,
        lastActiveAt: now,
      },
    });

    return updatedUser;
  });

  return NextResponse.json({
    xpEarned: lesson.xpReward,
    xpTotal: result.xpTotal,
    streakDays: result.streakDays,
    nextLessonId: nextLesson?.id ?? null,
  });
}
