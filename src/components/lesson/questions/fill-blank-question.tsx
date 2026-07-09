"use client";

import type { FillBlankPayload } from "@/lib/validations/learning-map";
import { cn } from "@/lib/utils";
import type { QuestionComponentProps } from "./types";

export function FillBlankQuestion({
  question,
  pending,
  onChange,
  revealed,
  isCorrect,
}: QuestionComponentProps) {
  const payload = question.payload as FillBlankPayload;
  const text = pending?.type === "FILL_BLANK" ? pending.text : "";
  const [before, after] = payload.textWithBlank.split("___");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold text-ink-900">{question.prompt}</h2>

      <p className="text-lg font-semibold leading-relaxed text-ink-700">
        {before}
        <input
          type="text"
          value={revealed ? payload.correctAnswer : text}
          disabled={revealed}
          onChange={(e) => onChange({ type: "FILL_BLANK", text: e.target.value })}
          className={cn(
            "mx-1 w-40 rounded-lg border-b-4 bg-ink-100 px-2 py-1 text-center font-extrabold outline-none",
            !revealed && "border-secondary-500 focus:bg-secondary-100",
            revealed && isCorrect && "border-primary-500 bg-primary-100 text-primary-700",
            revealed && !isCorrect && "border-red-500 bg-red-100 text-red-600",
          )}
        />
        {after}
      </p>

      {payload.hints && payload.hints.length > 0 && !revealed ? (
        <p className="text-xs font-bold uppercase tracking-wide text-ink-300">
          提示：{payload.hints.join("、")}
        </p>
      ) : null}

      {revealed && !isCorrect ? (
        <p className="text-sm font-bold text-red-500">
          正確答案：{payload.correctAnswer}
        </p>
      ) : null}
    </div>
  );
}
