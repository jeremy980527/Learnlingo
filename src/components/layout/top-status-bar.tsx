"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useGameStore } from "@/lib/game/store";
import { formatXp } from "@/lib/utils";

export function TopStatusBar({ backHref }: { backHref?: string }) {
  const hearts = useGameStore((s) => s.hearts);
  const maxHearts = useGameStore((s) => s.maxHearts);
  const streakDays = useGameStore((s) => s.streakDays);
  const xpTotal = useGameStore((s) => s.xpTotal);
  const tickHeartRegeneration = useGameStore((s) => s.tickHeartRegeneration);

  useEffect(() => {
    tickHeartRegeneration();
    const interval = setInterval(tickHeartRegeneration, 30_000);
    return () => clearInterval(interval);
  }, [tickHeartRegeneration]);

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b-2 border-ink-200 bg-white/90 px-4 py-3 backdrop-blur-sm">
      {backHref ? (
        <Link
          href={backHref}
          className="rounded-full px-2 py-1 text-sm font-extrabold text-ink-500 hover:bg-ink-100"
        >
          ← 返回
        </Link>
      ) : (
        <Link href="/dashboard" className="text-lg font-black text-primary-600">
          DuoLearn
        </Link>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Flame
            size={22}
            className={streakDays > 0 ? "fill-gold-500 text-gold-500" : "text-ink-300"}
          />
          <span className="text-sm font-extrabold text-ink-700">{streakDays}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-lg">⭐</span>
          <span className="text-sm font-extrabold text-ink-700">
            {formatXp(xpTotal)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <AnimatePresence mode="popLayout">
            {Array.from({ length: maxHearts }).map((_, index) => {
              const filled = index < hearts;
              return (
                <motion.span
                  key={index}
                  layout
                  initial={{ scale: 1 }}
                  animate={{ scale: 1 }}
                >
                  <Heart
                    size={22}
                    className={filled ? "fill-red-500 text-red-500" : "text-ink-200"}
                  />
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
