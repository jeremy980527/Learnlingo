import type { PendingAnswer } from "@/lib/game/check-answer";
import type { GeneratedQuestion } from "@/lib/validations/learning-map";

export interface QuestionComponentProps<TQuestion extends GeneratedQuestion = GeneratedQuestion> {
  question: TQuestion;
  pending: PendingAnswer | null;
  onChange: (pending: PendingAnswer) => void;
  revealed: boolean;
  isCorrect: boolean;
}
