import {
  Brain,
  Flame,
  Heart,
  Map as MapIcon,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/landing-hero";
import { FeatureCard } from "@/components/landing/feature-card";

const ICON_SIZE = 24;

const FEATURES = [
  {
    icon: <UploadCloud size={ICON_SIZE} />,
    title: "上傳任何教材",
    description: "講義、筆記、投影片截圖，支援 PDF、圖片與純文字檔案。",
    color: "primary" as const,
  },
  {
    icon: <Brain size={ICON_SIZE} />,
    title: "AI 自動拆解內容",
    description: "AI 分析你的教材，拆成單元與關卡，設計多種題型。",
    color: "secondary" as const,
  },
  {
    icon: <MapIcon size={ICON_SIZE} />,
    title: "遊戲化學習地圖",
    description: "蜿蜒的關卡地圖，一步步解鎖進度，學習不再枯燥。",
    color: "gold" as const,
  },
  {
    icon: <Heart size={ICON_SIZE} />,
    title: "生命值機制",
    description: "答錯扣血、答對得分，讓每一次練習都保持專注。",
    color: "red" as const,
  },
  {
    icon: <Flame size={ICON_SIZE} />,
    title: "連續學習天數",
    description: "累積 streak，養成每天學習的好習慣。",
    color: "purple" as const,
  },
  {
    icon: <Sparkles size={ICON_SIZE} />,
    title: "經驗值與星級評分",
    description: "完成關卡獲得 XP，依正確率獲得星級評分。",
    color: "primary" as const,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-ink-200 bg-white/90 px-6 py-4 backdrop-blur-sm">
        <span className="text-xl font-black text-primary-600">DuoLearn</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">登入</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">免費開始</Link>
          </Button>
        </div>
      </header>

      <LandingHero />

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="text-center text-3xl font-extrabold text-ink-900">
          把任何教材變成遊戲
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-medium text-ink-500">
          DuoLearn 使用 AI 幫你自動生成完整的遊戲化學習地圖，
          就像多鄰國一樣邊玩邊學。
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-ink-900">
          準備好開始了嗎？
        </h2>
        <p className="max-w-md font-medium text-ink-500">
          不需要信用卡，立即上傳你的第一份教材，體驗 AI 生成的學習地圖。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">免費建立帳號</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">先體驗展示模式</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t-2 border-ink-200 px-6 py-8 text-center text-sm font-semibold text-ink-300">
        © {new Date().getFullYear()} DuoLearn. 讓學習像遊戲一樣好玩。
      </footer>
    </div>
  );
}
