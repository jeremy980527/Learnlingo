"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, Brain, ScanText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { MaterialStatusResponse } from "@/lib/api/upload-material";

const STAGE_META: Record<
  MaterialStatusResponse["status"],
  { icon: React.ElementType; title: string; messages: string[] }
> = {
  UPLOADING: {
    icon: ScanText,
    title: "檔案上傳中",
    messages: ["正在安全地上傳你的教材..."],
  },
  PARSING: {
    icon: ScanText,
    title: "解析教材內容",
    messages: [
      "正在讀取你的講義文字...",
      "辨識圖片與 PDF 中的內容...",
      "整理段落與重點...",
    ],
  },
  GENERATING: {
    icon: Brain,
    title: "AI 正在畫地圖",
    messages: [
      "AI 正在幫你規劃單元與關卡...",
      "設計選擇題、填空題與配對題...",
      "安排練習順序，讓學習更有節奏...",
      "快完成了，最後修飾中...",
    ],
  },
  READY: { icon: Sparkles, title: "完成！", messages: ["準備進入你的學習地圖"] },
  FAILED: { icon: BookOpenText, title: "發生錯誤", messages: [] },
};

export function ProcessingAnimation({
  status,
}: {
  status: MaterialStatusResponse["status"];
}) {
  const meta = STAGE_META[status];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (meta.messages.length <= 1) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % meta.messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [meta.messages.length]);

  const Icon = meta.icon;

  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center">
      <motion.div
        className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary-100"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Icon size={56} className="text-primary-500" strokeWidth={1.5} />
        </motion.div>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary-400"
            style={{
              top: `${20 + i * 15}%`,
              left: i % 2 === 0 ? "5%" : "90%",
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-extrabold text-ink-900">{meta.title}</h2>
        <div className="h-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={meta.messages[messageIndex]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-semibold text-ink-500"
            >
              {meta.messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2">
        {(["UPLOADING", "PARSING", "GENERATING"] as const).map((stage) => {
          const stageOrder = ["UPLOADING", "PARSING", "GENERATING"];
          const isActive = stage === status;
          const isPast = stageOrder.indexOf(stage) < stageOrder.indexOf(status);
          return (
            <motion.div
              key={stage}
              className="h-2 w-10 rounded-full"
              animate={{
                backgroundColor:
                  isActive || isPast
                    ? "var(--color-primary-500)"
                    : "var(--color-ink-200)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
