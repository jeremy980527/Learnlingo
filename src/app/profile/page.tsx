import { AlertTriangle, Flame, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GameStateSync } from "@/components/layout/game-state-sync";
import { TopStatusBar } from "@/components/layout/top-status-bar";
import { HeartsStatusCard } from "@/components/profile/hearts-status-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { formatXp } from "@/lib/utils";

export default async function ProfilePage() {
  let user;
  try {
    user = await getCurrentAppUser();
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <AlertTriangle className="text-red-500" size={40} />
        <p className="font-bold text-ink-700">Supabase 尚未設定，無法讀取個人資料。</p>
      </div>
    );
  }

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  return (
    <div className="flex flex-1 flex-col">
      <GameStateSync xpTotal={user.xpTotal} streakDays={user.streakDays} />
      <TopStatusBar backHref="/dashboard" />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-2xl font-black text-white">
            {(user.displayName ?? user.email).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">
              {user.displayName ?? "未命名使用者"}
            </h1>
            <p className="text-sm font-medium text-ink-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col items-center gap-1 text-center">
            <Star size={28} className="fill-gold-500 text-gold-500" />
            <span className="text-2xl font-extrabold text-ink-900">
              {formatXp(user.xpTotal)}
            </span>
            <span className="text-xs font-bold uppercase text-ink-400">
              總經驗值
            </span>
          </Card>
          <Card className="flex flex-col items-center gap-1 text-center">
            <Flame size={28} className="fill-gold-500 text-gold-500" />
            <span className="text-2xl font-extrabold text-ink-900">
              {user.streakDays}
            </span>
            <span className="text-xs font-bold uppercase text-ink-400">
              連續學習天數
            </span>
          </Card>
        </div>

        <HeartsStatusCard />

        <Card>
          <CardHeader>
            <CardTitle>帳號</CardTitle>
            <CardDescription>管理你的登入狀態</CardDescription>
          </CardHeader>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="outline" fullWidth>
              <LogOut size={18} />
              登出
            </Button>
          </form>
        </Card>

        <Button variant="ghost" asChild>
          <Link href="/upload">上傳新的教材</Link>
        </Button>
      </div>
    </div>
  );
}
