"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { MultipleChoicePayload } from "@/lib/validations/learning-map";
import { cn } from "@/lib/utils";
import type { QuestionComponentProps } from "./types";

export function MultipleChoiceQuestion({
  question,
  pending,
  onChange,
  revealed,
}: QuestionComponentProps) {
  const payload = question.payload as MultipleChoicePayload;
  const selectedIndex =
    pending?.type === "MULTIPLE_CHOICE" ? pending.selectedIndex : null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold text-ink-900">{question.prompt}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {payload.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = revealed && index === payload.correctIndex;
          const isWrongSelected = revealed && isSelected && index !== payload.correctIndex;

          return (
            <motion.button
              key={option}
              type="button"
              disabled={revealed}
              onClick={() =>
                onChange({ type: "MULTIPLE_CHOICE", selectedIndex: index })
              }
              whileTap={!revealed ? { scale: 0.97 } : undefined}
              className={cn(
                "flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left text-base font-bold transition-colors",
                "border-ink-200 bg-white text-ink-900 hover:bg-ink-100",
                isSelected && !revealed && "border-secondary-500 bg-secondary-100",
                isCorrectOption && "border-primary-500 bg-primary-100 text-primary-700",
                isWrongSelected && "border-red-500 bg-red-100 text-red-600",
              )}
            >
              <span>{option}</span>
              {isCorrectOption && <Check size={20} className="text-primary-600" />}
              {isWrongSelected && <X size={20} className="text-red-600" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
