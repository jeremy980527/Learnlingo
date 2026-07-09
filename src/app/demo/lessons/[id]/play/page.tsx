"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LessonPlayer,
  type LessonCompletionResult,
} from "@/components/lesson/lesson-player";
import { Skeleton } from "@/components/ui/skeleton";
import {
  completeDemoLesson,
  findDemoLessonView,
  loadDemoProgress,
  loadOrCreateDemoMap,
} from "@/lib/demo/demo-storage";
import { useGameStore } from "@/lib/game/store";
import type { GeneratedMap } from "@/lib/validations/learning-map";
import type { LessonDetailView } from "@/types/view-models";

export default function DemoLessonPlayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const gainXp = useGameStore((s) => s.gainXp);

  const [map, setMap] = useState<GeneratedMap | null>(null);
  const [lesson, setLesson] = useState<LessonDetailView | null>(null);

  useEffect(() => {
    loadOrCreateDemoMap().then((generatedMap) => {
      const progress = loadDemoProgress(generatedMap);
      setMap(generatedMap);
      setLesson(findDemoLessonView(generatedMap, progress, params.id));
    });
  }, [params.id]);

  function goToDemoMap() {
    router.push("/demo");
  }

  function handleComplete(result: LessonCompletionResult) {
    if (!map) return;

    const progress = loadDemoProgress(map);
    completeDemoLesson(map, progress, params.id, result.stars);
    gainXp(result.xpEarned);

    const query = new URLSearchParams({
      stars: String(result.stars),
      xp: String(result.xpEarned),
      correct: String(result.correctCount),
      total: String(result.totalCount),
      materialId: "demo",
    });

    router.push(`/lessons/${params.id}/result?${query.toString()}`);
  }

  if (!lesson) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <LessonPlayer lesson={lesson} onExit={goToDemoMap} onComplete={handleComplete} />
  );
}
