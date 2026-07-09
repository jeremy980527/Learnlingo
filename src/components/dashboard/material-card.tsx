"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { MaterialSummary } from "@/lib/materials/list-materials";

const STATUS_LABEL: Record<MaterialSummary["status"], string> = {
  UPLOADING: "上傳中",
  PARSING: "解析中",
  GENERATING: "生成中",
  READY: "已完成",
  FAILED: "發生錯誤",
};

export function MaterialCard({ material }: { material: MaterialSummary }) {
  const href =
    material.status === "READY"
      ? `/materials/${material.id}/map`
      : `/materials/${material.id}/processing`;

  const progressPercent =
    material.lessonCount > 0
      ? (material.completedLessonCount / material.lessonCount) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Link href={href}>
        <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-[0_6px_0_0_var(--color-ink-200)]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              {material.status === "FAILED" ? (
                <AlertTriangle size={20} className="text-red-500" />
              ) : material.status === "READY" ? (
                <BookOpen size={20} />
              ) : (
                <Loader2 size={20} className="animate-spin" />
              )}
            </div>
            <Badge
              variant={
                material.status === "READY"
                  ? "primary"
                  : material.status === "FAILED"
                    ? "red"
                    : "secondary"
              }
            >
              {STATUS_LABEL[material.status]}
            </Badge>
          </div>

          <p className="truncate text-base font-extrabold text-ink-900">
            {material.filename}
          </p>

          {material.status === "READY" ? (
            <ProgressBar
              value={progressPercent}
              label={`${material.completedLessonCount} / ${material.lessonCount} 關卡完成`}
            />
          ) : material.status === "FAILED" ? (
            <p className="text-xs font-semibold text-red-500">
              {material.errorMessage ?? "處理失敗"}
            </p>
          ) : (
            <p className="text-xs font-semibold text-ink-400">AI 正在生成學習地圖...</p>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
