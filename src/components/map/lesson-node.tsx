"use client";

import { motion } from "framer-motion";
import { Check, Crown, Dumbbell, Lock, Star, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LessonSummaryView } from "@/types/view-models";
import type { GeneratedUnit } from "@/lib/validations/learning-map";
import { cn } from "@/lib/utils";

const THEME_CLASSES: Record<
  GeneratedUnit["colorTheme"],
  { bg: string; shadow: string; ring: string }
> = {
  primary: {
    bg: "bg-primary-500",
    shadow: "shadow-[0_6px_0_0_var(--color-primary-600)]",
    ring: "ring-primary-300",
  },
  secondary: {
    bg: "bg-secondary-500",
    shadow: "shadow-[0_6px_0_0_var(--color-secondary-600)]",
    ring: "ring-secondary-300",
  },
  gold: {
    bg: "bg-gold-500",
    shadow: "shadow-[0_6px_0_0_var(--color-gold-600)]",
    ring: "ring-gold-300",
  },
  purple: {
    bg: "bg-purple-500",
    shadow: "shadow-[0_6px_0_0_var(--color-purple-600)]",
    ring: "ring-purple-300",
  },
  red: {
    bg: "bg-red-500",
    shadow: "shadow-[0_6px_0_0_var(--color-red-600)]",
    ring: "ring-red-300",
  },
};

function LessonIcon({ lesson }: { lesson: LessonSummaryView }) {
  if (lesson.status === "COMPLETED") return <Check size={28} strokeWidth={3} />;
  if (lesson.status === "LOCKED") return <Lock size={24} />;
  if (lesson.type === "BOSS") return <Crown size={28} />;
  if (lesson.type === "TEST") return <Swords size={26} />;
  return <Dumbbell size={26} />;
}

export function LessonNode({
  lesson,
  colorTheme,
  isCurrent,
  offsetX,
  buildHref = (lessonId) => `/lessons/${lessonId}/play`,
}: {
  lesson: LessonSummaryView;
  colorTheme: GeneratedUnit["colorTheme"];
  isCurrent: boolean;
  offsetX: number;
  buildHref?: (lessonId: string) => string;
}) {
  const router = useRouter();
  const [isShaking, setIsShaking] = useState(false);
  const theme = THEME_CLASSES[colorTheme];
  const isLocked = lesson.status === "LOCKED";

  function handleClick() {
    if (isLocked) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      return;
    }
    router.push(buildHref(lesson.id));
  }

  return (
    <div
      className="flex flex-col items-center"
      style={{ transform: `translateX(${offsetX}px)` }}
    >
      {isCurrent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 rounded-xl bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary-600 shadow-[0_3px_0_0_var(--color-ink-200)]"
        >
          開始
        </motion.div>
      )}
      <motion.button
        onClick={handleClick}
        animate={
          isShaking
            ? { x: [-6, 6, -5, 5, -3, 3, 0] }
            : isCurrent
              ? { scale: [1, 1.06, 1] }
              : { scale: 1 }
        }
        transition={
          isShaking
            ? { duration: 0.4 }
            : { repeat: isCurrent ? Infinity : 0, duration: 1.6 }
        }
        whileTap={!isLocked ? { y: 6, boxShadow: "0 0 0 0 transparent" } : undefined}
        className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-full text-white transition-colors",
          isLocked
            ? "bg-ink-200 text-ink-400 shadow-[0_6px_0_0_var(--color-ink-300)]"
            : cn(theme.bg, theme.shadow),
          isCurrent && `ring-4 ${theme.ring} ring-offset-4`,
        )}
        aria-label={lesson.title}
      >
        <LessonIcon lesson={lesson} />
      </motion.button>

      {lesson.status === "COMPLETED" && (
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < lesson.stars
                  ? "fill-gold-500 text-gold-500"
                  : "fill-ink-200 text-ink-200"
              }
            />
          ))}
        </div>
      )}

      <p className="mt-1.5 max-w-[100px] text-center text-xs font-bold text-ink-500">
        {lesson.title}
      </p>
    </div>
  );
}
