import { mockLearningMapProvider } from "@/lib/ai/mock-provider";
import { DEMO_MATERIAL_FILENAME, DEMO_MATERIAL_TEXT } from "@/lib/demo/sample-material";
import type { GeneratedMap } from "@/lib/validations/learning-map";
import type {
  LessonDetailView,
  LessonProgressStatus,
  MapView,
} from "@/types/view-models";

const MAP_KEY = "duolearn-demo-map";
const PROGRESS_KEY = "duolearn-demo-progress";

export type DemoProgress = Record<string, { status: LessonProgressStatus; stars: number }>;

export async function loadOrCreateDemoMap(): Promise<GeneratedMap> {
  const cached = sessionStorage.getItem(MAP_KEY);
  if (cached) {
    return JSON.parse(cached) as GeneratedMap;
  }

  const map = await mockLearningMapProvider.generateLearningMap({
    rawText: DEMO_MATERIAL_TEXT,
    materialFilename: DEMO_MATERIAL_FILENAME,
  });

  sessionStorage.setItem(MAP_KEY, JSON.stringify(map));
  return map;
}

export function resetDemoMap() {
  sessionStorage.removeItem(MAP_KEY);
  sessionStorage.removeItem(PROGRESS_KEY);
}

export function loadDemoProgress(map: GeneratedMap): DemoProgress {
  const cached = sessionStorage.getItem(PROGRESS_KEY);
  if (cached) {
    return JSON.parse(cached) as DemoProgress;
  }

  const progress: DemoProgress = {};
  map.units.forEach((unit, unitIndex) => {
    unit.lessons.forEach((lesson, lessonIndex) => {
      const isFirst = unitIndex === 0 && lessonIndex === 0;
      progress[lesson.id] = {
        status: isFirst ? "AVAILABLE" : "LOCKED",
        stars: 0,
      };
    });
  });

  sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}

export function saveDemoProgress(progress: DemoProgress) {
  sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function buildDemoMapView(map: GeneratedMap, progress: DemoProgress): MapView {
  return {
    materialId: "demo",
    materialTitle: map.materialTitle,
    units: map.units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      description: unit.description,
      order: unit.order,
      icon: unit.icon,
      colorTheme: unit.colorTheme,
      lessons: unit.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        order: lesson.order,
        xpReward: lesson.xpReward,
        status: progress[lesson.id]?.status ?? "LOCKED",
        stars: progress[lesson.id]?.stars ?? 0,
      })),
    })),
  };
}

export function findDemoLessonView(
  map: GeneratedMap,
  progress: DemoProgress,
  lessonId: string,
): LessonDetailView | null {
  for (const unit of map.units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        order: lesson.order,
        xpReward: lesson.xpReward,
        status: progress[lesson.id]?.status ?? "LOCKED",
        stars: progress[lesson.id]?.stars ?? 0,
        unitTitle: unit.title,
        materialId: "demo",
        questions: lesson.questions,
      };
    }
  }
  return null;
}

export function completeDemoLesson(
  map: GeneratedMap,
  progress: DemoProgress,
  lessonId: string,
  stars: number,
): DemoProgress {
  const next: DemoProgress = { ...progress };
  next[lessonId] = {
    status: "COMPLETED",
    stars: Math.max(progress[lessonId]?.stars ?? 0, stars),
  };

  const allLessons = map.units.flatMap((unit) => unit.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentIndex + 1];

  if (nextLesson && (!next[nextLesson.id] || next[nextLesson.id].status === "LOCKED")) {
    next[nextLesson.id] = {
      status: "AVAILABLE",
      stars: next[nextLesson.id]?.stars ?? 0,
    };
  }

  saveDemoProgress(next);
  return next;
}
