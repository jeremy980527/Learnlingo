"use client";

import { RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { MapPath } from "@/components/map/map-path";
import { TopStatusBar } from "@/components/layout/top-status-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildDemoMapView,
  loadDemoProgress,
  loadOrCreateDemoMap,
  resetDemoMap,
  type DemoProgress,
} from "@/lib/demo/demo-storage";
import type { GeneratedMap } from "@/lib/validations/learning-map";

export default function DemoPage() {
  const [map, setMap] = useState<GeneratedMap | null>(null);
  const [progress, setProgress] = useState<DemoProgress | null>(null);

  useEffect(() => {
    loadOrCreateDemoMap().then((generatedMap) => {
      setMap(generatedMap);
      setProgress(loadDemoProgress(generatedMap));
    });
  }, []);

  function handleReset() {
    resetDemoMap();
    setMap(null);
    setProgress(null);
    loadOrCreateDemoMap().then((generatedMap) => {
      setMap(generatedMap);
      setProgress(loadDemoProgress(generatedMap));
    });
  }

  if (!map || !progress) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const mapView = buildDemoMapView(map, progress);

  return (
    <div className="flex flex-1 flex-col">
      <TopStatusBar backHref="/" />

      <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-2 px-4 text-center">
        <span className="flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-secondary-600">
          <Sparkles size={14} />
          展示模式（不需要註冊）
        </span>
        <h1 className="text-2xl font-extrabold text-ink-900">
          {mapView.materialTitle}
        </h1>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw size={14} />
          重設展示進度
        </Button>
      </div>

      <MapPath
        map={mapView}
        buildLessonHref={(lessonId) => `/demo/lessons/${lessonId}/play`}
      />
    </div>
  );
}
