import { AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TopStatusBar } from "@/components/layout/top-status-bar";
import { GameStateSync } from "@/components/layout/game-state-sync";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { MaterialCard } from "@/components/dashboard/material-card";
import { Button } from "@/components/ui/button";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { listMaterialsForUser } from "@/lib/materials/list-materials";

export default async function DashboardPage() {
  let user;
  try {
    user = await getCurrentAppUser();
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <AlertTriangle className="text-red-500" size={40} />
        <p className="font-bold text-ink-700">
          Supabase 尚未設定，無法讀取你的教材列表。你可以先前往展示模式體驗完整功能。
        </p>
        <Button asChild>
          <Link href="/demo">前往展示模式</Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const materials = await listMaterialsForUser(user.id);

  return (
    <div className="flex flex-1 flex-col">
      <GameStateSync xpTotal={user.xpTotal} streakDays={user.streakDays} />
      <TopStatusBar />

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-ink-900">我的教材</h1>
          {materials.length > 0 && (
            <Button asChild>
              <Link href="/upload">
                <Plus size={18} />
                上傳新教材
              </Link>
            </Button>
          )}
        </div>

        {materials.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
