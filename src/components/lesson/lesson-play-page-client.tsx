"use client";

import { useRouter } from "next/navigation";
import { LessonPlayer, type LessonCompletionResult } from "@/components/lesson/lesson-player";
import { completeLesson } from "@/lib/api/lessons";
import { useGameStore } from "@/lib/game/store";
import type { LessonDetailView } from "@/types/view-models";

export function LessonPlayPageClient({ lesson }: { lesson: LessonDetailView }) {
  const router = useRouter();
  const gainXp = useGameStore((s) => s.gainXp);
  const syncFromServer = useGameStore((s) => s.syncFromServer);

  function goToMap() {
    router.push(`/materials/${lesson.materialId}/map`);
  }

  async function handleComplete(result: LessonCompletionResult) {
    try {
      const response = await completeLesson(lesson.id, {
        stars: result.stars,
        correctCount: result.correctCount,
        totalCount: result.totalCount,
      });
      syncFromServer({
        xpTotal: response.xpTotal,
        streakDays: response.streakDays,
      });
    } catch (error) {
      console.error("儲存學習進度失敗：", error);
      gainXp(result.xpEarned);
    }

    const query = new URLSearchParams({
      stars: String(result.stars),
      xp: String(result.xpEarned),
      correct: String(result.correctCount),
      total: String(result.totalCount),
      materialId: lesson.materialId,
    });

    router.push(`/lessons/${lesson.id}/result?${query.toString()}`);
  }

  return (
    <LessonPlayer lesson={lesson} onExit={goToMap} onComplete={handleComplete} />
  );
}
