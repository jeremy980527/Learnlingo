"use client";

import { motion } from "framer-motion";
import { Flame, Heart, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white px-6 py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black leading-tight text-ink-900 sm:text-5xl">
            把你的講義
            <br />
            變成
            <span className="text-primary-500">遊戲化學習地圖</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl text-lg font-medium text-ink-500"
        >
          上傳筆記、講義或截圖，AI 自動幫你拆解成單元與關卡，
          像多鄰國一樣邊玩邊學，養成每天學習的習慣。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button size="lg" asChild>
            <Link href="/register">免費開始使用</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8 flex items-center gap-6 rounded-3xl border-2 border-ink-200 bg-white px-8 py-5 shadow-[0_4px_0_0_var(--color-ink-200)]"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="fill-gold-500 text-gold-500" size={22} />
            <span className="font-extrabold text-ink-700">12</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="fill-red-500 text-red-500" size={22} />
            <span className="font-extrabold text-ink-700">5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="fill-gold-500 text-gold-500" size={22} />
            <span className="font-extrabold text-ink-700">1,280 XP</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none absolute -left-10 top-10 h-24 w-24 rounded-full bg-secondary-100 blur-2xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="pointer-events-none absolute -right-10 bottom-10 h-32 w-32 rounded-full bg-gold-100 blur-2xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
      />
    </section>
  );
}
