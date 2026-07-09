import { prisma } from "@/lib/db";
import type { GeneratedQuestion } from "@/lib/validations/learning-map";
import type { LessonDetailView, LessonProgressStatus } from "@/types/view-models";

export async function getLessonView(
  lessonId: string,
  userId: string,
): Promise<LessonDetailView | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: { include: { material: true } },
      questions: { orderBy: { order: "asc" } },
      progress: { where: { userId } },
    },
  });

  if (!lesson || lesson.unit.material.userId !== userId) return null;

  const progress = lesson.progress[0];

  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    order: lesson.order,
    xpReward: lesson.xpReward,
    status: (progress?.status ?? "LOCKED") as LessonProgressStatus,
    stars: progress?.stars ?? 0,
    unitTitle: lesson.unit.title,
    materialId: lesson.unit.materialId,
    questions: lesson.questions.map((question) => ({
      id: question.id,
      type: question.type,
      order: question.order,
      prompt: question.prompt,
      payload: question.payload,
    })) as GeneratedQuestion[],
  };
}
