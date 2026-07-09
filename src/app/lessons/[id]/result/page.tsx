"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CONFETTI_COLORS = [
  "var(--color-primary-500)",
  "var(--color-secondary-500)",
  "var(--color-gold-500)",
  "var(--color-purple-500)",
  "var(--color-red-500)",
];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 500, opacity: 0, rotate: 360 }}
          transition={{
            duration: 2 + (i % 5) * 0.3,
            delay: i * 0.05,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();

  const stars = Number(params.get("stars") ?? 0);
  const xp = Number(params.get("xp") ?? 0);
  const correct = Number(params.get("correct") ?? 0);
  const total = Number(params.get("total") ?? 1);
  const materialId = params.get("materialId") ?? "";

  const accuracy = Math.round((correct / total) * 100);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-4 py-16">
      {stars === 3 && <Confetti />}

      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold text-ink-900"
      >
        關卡完成！
      </motion.h1>

      <div className="flex gap-3">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3 + index * 0.25,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
          >
            <Star
              size={64}
              className={
                index < stars
                  ? "fill-gold-500 text-gold-500"
                  : "fill-ink-200 text-ink-200"
              }
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="w-full max-w-sm"
      >
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink-500">獲得經驗值</span>
            <span className="flex items-center gap-1 text-xl font-extrabold text-gold-600">
              ⭐ +{xp} XP
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink-500">正確率</span>
            <span className="text-xl font-extrabold text-primary-600">
              {accuracy}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink-500">答對題數</span>
            <span className="text-xl font-extrabold text-ink-900">
              {correct} / {total}
            </span>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="w-full max-w-sm"
      >
        <Button
          fullWidth
          size="lg"
          onClick={() =>
            router.push(
              materialId === "demo" ? "/demo" : `/materials/${materialId}/map`,
            )
          }
        >
          返回學習地圖
        </Button>
      </motion.div>
    </div>
  );
}

export default function LessonResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
