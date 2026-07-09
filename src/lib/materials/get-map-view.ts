import { prisma } from "@/lib/db";
import type { LessonProgressStatus, MapView } from "@/types/view-models";

export async function getMapView(
  materialId: string,
  userId: string,
): Promise<MapView | null> {
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: { where: { userId } },
            },
          },
        },
      },
    },
  });

  if (!material || material.userId !== userId) return null;

  return {
    materialId: material.id,
    materialTitle: material.filename,
    units: material.units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      description: unit.description ?? undefined,
      order: unit.order,
      icon: unit.icon,
      colorTheme: unit.colorTheme as MapView["units"][number]["colorTheme"],
      lessons: unit.lessons.map((lesson) => {
        const progress = lesson.progress[0];
        return {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          order: lesson.order,
          xpReward: lesson.xpReward,
          status: (progress?.status ?? "LOCKED") as LessonProgressStatus,
          stars: progress?.stars ?? 0,
        };
      }),
    })),
  };
}
