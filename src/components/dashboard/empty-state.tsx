"use client";

import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 rounded-3xl border-4 border-dashed border-ink-200 bg-white px-6 py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        <UploadCloud size={64} className="text-primary-400" strokeWidth={1.5} />
      </motion.div>
      <div>
        <h2 className="text-xl font-extrabold text-ink-900">
          上傳你的第一份教材
        </h2>
        <p className="mt-1 text-sm font-medium text-ink-500">
          講義、筆記或截圖都可以，AI 會幫你自動生成學習地圖
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/upload">開始上傳</Link>
      </Button>
    </motion.div>
  );
}
