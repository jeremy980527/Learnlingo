"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AnswerFeedback({
  isCorrect,
  onContinue,
  isLastQuestion,
}: {
  isCorrect: boolean | null;
  onContinue: () => void;
  isLastQuestion: boolean;
}) {
  return (
    <AnimatePresence>
      {isCorrect !== null && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t-2 px-4 py-5",
            isCorrect
              ? "border-primary-300 bg-primary-100"
              : "border-red-300 bg-red-100",
          )}
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 size={32} className="text-primary-600" />
              ) : (
                <XCircle size={32} className="text-red-600" />
              )}
              <span
                className={cn(
                  "text-lg font-extrabold",
                  isCorrect ? "text-primary-700" : "text-red-600",
                )}
              >
                {isCorrect ? "太棒了！" : "答錯了，繼續加油！"}
              </span>
            </div>
            <Button
              variant={isCorrect ? "primary" : "danger"}
              size="lg"
              onClick={onContinue}
            >
              {isLastQuestion ? "完成關卡" : "繼續"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
