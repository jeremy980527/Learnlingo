import type { GeneratedMap } from "@/lib/validations/learning-map";

export interface LearningMapProvider {
  name: string;
  generateLearningMap(input: {
    rawText: string;
    materialFilename: string;
  }): Promise<GeneratedMap>;
}

export class AiGenerationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AiGenerationError";
  }
}
