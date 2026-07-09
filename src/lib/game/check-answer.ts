import type {
  FillBlankPayload,
  GeneratedQuestion,
  MatchingPayload,
  MultipleChoicePayload,
  ReorderPayload,
} from "@/lib/validations/learning-map";

export type PendingAnswer =
  | { type: "MULTIPLE_CHOICE"; selectedIndex: number }
  | { type: "FILL_BLANK"; text: string }
  | { type: "MATCHING"; matches: Record<string, string> }
  | { type: "REORDER"; order: number[] };

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/[.,!?，。！？\s]/g, "");
}

export function isPendingComplete(
  question: GeneratedQuestion,
  pending: PendingAnswer | null,
): boolean {
  if (!pending) return false;

  switch (question.type) {
    case "MULTIPLE_CHOICE":
      return pending.type === "MULTIPLE_CHOICE" && pending.selectedIndex >= 0;
    case "FILL_BLANK":
      return pending.type === "FILL_BLANK" && pending.text.trim().length > 0;
    case "MATCHING": {
      if (pending.type !== "MATCHING") return false;
      const payload = question.payload as MatchingPayload;
      return payload.pairs.every((pair) => Boolean(pending.matches[pair.left]));
    }
    case "REORDER": {
      if (pending.type !== "REORDER") return false;
      const payload = question.payload as ReorderPayload;
      return pending.order.length === payload.tokens.length;
    }
    default:
      return false;
  }
}

export function isAnswerCorrect(
  question: GeneratedQuestion,
  pending: PendingAnswer | null,
): boolean {
  if (!pending) return false;

  switch (question.type) {
    case "MULTIPLE_CHOICE": {
      if (pending.type !== "MULTIPLE_CHOICE") return false;
      const payload = question.payload as MultipleChoicePayload;
      return pending.selectedIndex === payload.correctIndex;
    }
    case "FILL_BLANK": {
      if (pending.type !== "FILL_BLANK") return false;
      const payload = question.payload as FillBlankPayload;
      return normalize(pending.text) === normalize(payload.correctAnswer);
    }
    case "MATCHING": {
      if (pending.type !== "MATCHING") return false;
      const payload = question.payload as MatchingPayload;
      return payload.pairs.every(
        (pair) => pending.matches[pair.left] === pair.right,
      );
    }
    case "REORDER": {
      if (pending.type !== "REORDER") return false;
      const payload = question.payload as ReorderPayload;
      return (
        pending.order.length === payload.correctOrder.length &&
        pending.order.every((value, index) => value === payload.correctOrder[index])
      );
    }
    default:
      return false;
  }
}
