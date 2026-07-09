"use client";

import { motion } from "framer-motion";
import { LessonNode } from "@/components/map/lesson-node";
import { UnitBanner } from "@/components/map/unit-banner";
import { offsetForIndex, ROW_HEIGHT, UnitPathSvg } from "@/components/map/unit-path-svg";
import type { MapView } from "@/types/view-models";

export function MapPath({
  map,
  buildLessonHref,
}: {
  map: MapView;
  buildLessonHref?: (lessonId: string) => string;
}) {
  const allLessons = map.units.flatMap((unit) => unit.lessons);
  const firstAvailableId = allLessons.find((l) => l.status === "AVAILABLE")?.id;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-4 pb-24 pt-8">
      {map.units.map((unit, unitIndex) => (
        <motion.div
          key={unit.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: unitIndex * 0.05 }}
          className="flex flex-col gap-6"
        >
          <UnitBanner
            title={unit.title}
            description={unit.description}
            colorTheme={unit.colorTheme}
          />

          <div
            className="relative mx-auto w-full"
            style={{ height: unit.lessons.length * ROW_HEIGHT }}
          >
            <UnitPathSvg lessonCount={unit.lessons.length} />
            {unit.lessons.map((lesson, lessonIndex) => (
              <div
                key={lesson.id}
                className="absolute left-1/2 flex -translate-x-1/2 justify-center"
                style={{ top: lessonIndex * ROW_HEIGHT, width: 100 }}
              >
                <LessonNode
                  lesson={lesson}
                  colorTheme={unit.colorTheme}
                  isCurrent={lesson.id === firstAvailableId}
                  offsetX={offsetForIndex(lessonIndex)}
                  buildHref={buildLessonHref}
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
