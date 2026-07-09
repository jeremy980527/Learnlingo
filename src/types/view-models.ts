import type {
  GeneratedQuestion,
  GeneratedUnit,
  LessonType,
} from "@/lib/validations/learning-map";

export type LessonProgressStatus = "LOCKED" | "AVAILABLE" | "COMPLETED";

export interface LessonSummaryView {
  id: string;
  title: string;
  type: LessonType;
  order: number;
  xpReward: number;
  status: LessonProgressStatus;
  stars: number;
}

export interface LessonDetailView extends LessonSummaryView {
  questions: GeneratedQuestion[];
  unitTitle: string;
  materialId: string;
}

export interface UnitView extends Omit<GeneratedUnit, "lessons"> {
  lessons: LessonSummaryView[];
}

export interface MapView {
  materialId: string;
  materialTitle: string;
  units: UnitView[];
}
