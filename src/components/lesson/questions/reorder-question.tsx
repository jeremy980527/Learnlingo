"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReorderPayload } from "@/lib/validations/learning-map";
import { cn } from "@/lib/utils";
import type { QuestionComponentProps } from "./types";

export function ReorderQuestion({
  question,
  pending,
  onChange,
  revealed,
  isCorrect,
}: QuestionComponentProps) {
  const payload = question.payload as ReorderPayload;
  const order = pending?.type === "REORDER" ? pending.order : [];
  const usedSet = new Set(order);

  function addToken(tokenIndex: number) {
    if (revealed || usedSet.has(tokenIndex)) return;
    onChange({ type: "REORDER", order: [...order, tokenIndex] });
  }

  function removeAt(position: number) {
    if (revealed) return;
    const next = order.filter((_, i) => i !== position);
    onChange({ type: "REORDER", order: next });
  }

  const displayOrder = revealed ? payload.correctOrder : order;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-extrabold text-ink-900">{question.prompt}</h2>

      <div
        className={cn(
          "flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 bg-ink-100 p-3",
          revealed && isCorrect && "border-primary-400 bg-primary-50",
          revealed && !isCorrect && "border-red-400 bg-red-50",
        )}
      >
        <AnimatePresence>
          {displayOrder.map((tokenIndex, position) => (
            <motion.button
              key={`${tokenIndex}-${position}`}
              type="button"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              disabled={revealed}
              onClick={() => removeAt(position)}
              className="rounded-xl border-2 border-ink-300 bg-white px-4 py-2 text-sm font-extrabold text-ink-900 shadow-[0_2px_0_0_var(--color-ink-300)]"
            >
              {payload.tokens[tokenIndex]}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2">
        {payload.tokens.map((token, index) => {
          if (usedSet.has(index)) return null;
          return (
            <motion.button
              key={index}
              type="button"
              layout
              disabled={revealed}
              onClick={() => addToken(index)}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border-2 border-ink-200 bg-white px-4 py-2 text-sm font-extrabold text-ink-700 hover:bg-ink-100"
            >
              {token}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
