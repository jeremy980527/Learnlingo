import type { LearningMapProvider } from "./types";
import { claudeLearningMapProvider } from "./claude-provider";
import { mockLearningMapProvider } from "./mock-provider";

export function getLearningMapProvider(): LearningMapProvider {
  if (process.env.ANTHROPIC_API_KEY) {
    return claudeLearningMapProvider;
  }
  return mockLearningMapProvider;
}

export * from "./types";
export { claudeLearningMapProvider, mockLearningMapProvider };
