"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { AnswerFeedback } from "@/components/lesson/answer-feedback";
import { ExitConfirmModal } from "@/components/lesson/exit-confirm-modal";
import { OutOfHeartsModal } from "@/components/lesson/out-of-hearts-modal";
import { QuestionRenderer } from "@/components/lesson/questions/question-renderer";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  isAnswerCorrect,
  isPendingComplete,
  type PendingAnswer,
} from "@/lib/game/check-answer";
import { useGameStore } from "@/lib/game/store";
import type { LessonDetailView } from "@/types/view-models";

export interface LessonCompletionResult {
  correctCount: number;
  totalCount: number;
  mistakeCount: number;
  stars: number;
  xpEarned: number;
}

export function LessonPlayer({
  lesson,
  onExit,
  onComplete,
}: {
  lesson: LessonDetailView;
  onExit: () => void;
  onComplete: (result: LessonCompletionResult) => void;
}) {
  const hearts = useGameStore((s) => s.hearts);
  const loseHeart = useGameStore((s) => s.loseHeart);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pending, setPending] = useState<PendingAnswer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [forcedOutOfHearts, setForcedOutOfHearts] = useState(false);

  const outOfHearts = forcedOutOfHearts || hearts <= 0;
  const currentQuestion = lesson.questions[currentIndex];
  const isLastQuestion = currentIndex === lesson.questions.length - 1;

  function handleCheck() {
    const correct = isAnswerCorrect(currentQuestion, pending);
    setIsCorrect(correct);
    setRevealed(true);

    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setMistakeCount((m) => m + 1);
      const heartsRemain = loseHeart();
      if (!heartsRemain) {
        setForcedOutOfHearts(true);
      }
    }
  }

  function handleContinue() {
    if (outOfHearts) return;

    if (isLastQuestion) {
      const stars = mistakeCount === 0 ? 3 : mistakeCount <= 2 ? 2 : 1;
      onComplete({
        correctCount,
        totalCount: lesson.questions.length,
        mistakeCount,
        stars,
        xpEarned: lesson.xpReward,
      });
      return;
    }

    setCurrentIndex((i) => i + 1);
    setPending(null);
    setRevealed(false);
    setIsCorrect(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-4 px-4 py-4">
        <button
          onClick={() => setExitModalOpen(true)}
          className="rounded-full p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          aria-label="離開關卡"
        >
          <X size={22} />
        </button>
        <ProgressBar
          value={currentIndex + (revealed ? 1 : 0)}
          max={lesson.questions.length}
          className="flex-1"
        />
        <div className="flex items-center gap-1 text-sm font-extrabold text-red-500">
          ❤ {hearts}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <QuestionRenderer
              question={currentQuestion}
              pending={pending}
              onChange={setPending}
              revealed={revealed}
              isCorrect={Boolean(isCorrect)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {!revealed && (
        <div className="fixed inset-x-0 bottom-0 border-t-2 border-ink-200 bg-white px-4 py-5">
          <div className="mx-auto flex w-full max-w-2xl justify-end">
            <Button
              size="lg"
              disabled={!isPendingComplete(currentQuestion, pending)}
              onClick={handleCheck}
            >
              檢查答案
            </Button>
          </div>
        </div>
      )}

      <AnswerFeedback
        isCorrect={revealed ? isCorrect : null}
        onContinue={handleContinue}
        isLastQuestion={isLastQuestion}
      />

      <ExitConfirmModal
        open={exitModalOpen}
        onOpenChange={setExitModalOpen}
        onConfirm={onExit}
      />

      <OutOfHeartsModal open={outOfHearts} onBackToMap={onExit} />
    </div>
  );
}
