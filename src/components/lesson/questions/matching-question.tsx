"use client";

import { useMemo, useState } from "react";
import type { MatchingPayload } from "@/lib/validations/learning-map";
import { cn } from "@/lib/utils";
import type { QuestionComponentProps } from "./types";

function shuffleDeterministic<T>(items: T[], seed: string): T[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = hash % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MatchingQuestion({
  question,
  pending,
  onChange,
  revealed,
}: QuestionComponentProps) {
  const payload = question.payload as MatchingPayload;
  const matches = pending?.type === "MATCHING" ? pending.matches : {};

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const rightOptions = useMemo(
    () => shuffleDeterministic(payload.pairs.map((p) => p.right), question.id),
    [payload.pairs, question.id],
  );

  const matchedRights = new Set(Object.values(matches));

  function handleLeftClick(left: string) {
    if (revealed || matches[left]) return;
    setSelectedLeft((prev) => (prev === left ? null : left));
  }

  function handleRightClick(right: string) {
    if (revealed || matchedRights.has(right) || !selectedLeft) return;
    const nextMatches = { ...matches, [selectedLeft]: right };
    onChange({ type: "MATCHING", matches: nextMatches });
    setSelectedLeft(null);
  }

  function isRightCorrectFor(left: string, right: string) {
    return payload.pairs.some((p) => p.left === left && p.right === right);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold text-ink-900">{question.prompt}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          {payload.pairs.map((pair) => {
            const isMatched = Boolean(matches[pair.left]);
            const isSelected = selectedLeft === pair.left;
            const correct = revealed && isRightCorrectFor(pair.left, matches[pair.left] ?? "");
            return (
              <button
                key={pair.left}
                type="button"
                disabled={revealed || isMatched}
                onClick={() => handleLeftClick(pair.left)}
                className={cn(
                  "rounded-2xl border-2 border-ink-200 bg-white px-4 py-3 text-left text-sm font-bold text-ink-900 transition-colors",
                  isSelected && "border-secondary-500 bg-secondary-100",
                  isMatched && !revealed && "border-primary-300 bg-primary-50 text-ink-400",
                  revealed && correct && "border-primary-500 bg-primary-100",
                  revealed && isMatched && !correct && "border-red-500 bg-red-100",
                )}
              >
                {pair.left}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {rightOptions.map((right) => {
            const isMatched = matchedRights.has(right);
            return (
              <button
                key={right}
                type="button"
                disabled={revealed || isMatched || !selectedLeft}
                onClick={() => handleRightClick(right)}
                className={cn(
                  "rounded-2xl border-2 border-ink-200 bg-white px-4 py-3 text-left text-sm font-bold text-ink-900 transition-colors",
                  isMatched && "border-primary-300 bg-primary-50 text-ink-400",
                  !isMatched && selectedLeft && "hover:border-secondary-300 hover:bg-secondary-50",
                )}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
