import { prisma } from "@/lib/db";

export interface MaterialSummary {
  id: string;
  filename: string;
  status: "UPLOADING" | "PARSING" | "GENERATING" | "READY" | "FAILED";
  errorMessage: string | null;
  unitCount: number;
  lessonCount: number;
  completedLessonCount: number;
  createdAt: string;
}

export async function listMaterialsForUser(
  userId: string,
): Promise<MaterialSummary[]> {
  const materials = await prisma.material.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      units: {
        include: {
          lessons: {
            include: { progress: { where: { userId } } },
          },
        },
      },
    },
  });

  return materials.map((material) => {
    const lessons = material.units.flatMap((unit) => unit.lessons);
    const completedLessonCount = lessons.filter(
      (lesson) => lesson.progress[0]?.status === "COMPLETED",
    ).length;

    return {
      id: material.id,
      filename: material.filename,
      status: material.status,
      errorMessage: material.errorMessage,
      unitCount: material.units.length,
      lessonCount: lessons.length,
      completedLessonCount,
      createdAt: material.createdAt.toISOString(),
    };
  });
}
