import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPath } from "@/components/map/map-path";
import { GameStateSync } from "@/components/layout/game-state-sync";
import { TopStatusBar } from "@/components/layout/top-status-bar";
import { Button } from "@/components/ui/button";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { getMapView } from "@/lib/materials/get-map-view";

export default async function MaterialMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user;
  try {
    user = await getCurrentAppUser();
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <AlertTriangle className="text-red-500" size={40} />
        <p className="font-bold text-ink-700">
          Supabase 尚未設定，無法讀取學習地圖。請先在環境變數中設定 Supabase 連線資訊。
        </p>
        <Button asChild>
          <Link href="/demo">先體驗展示模式</Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    redirect(`/login?redirectTo=/materials/${id}/map`);
  }

  const mapView = await getMapView(id, user.id);

  if (!mapView) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <GameStateSync xpTotal={user.xpTotal} streakDays={user.streakDays} />
      <TopStatusBar backHref="/dashboard" />
      <div className="mb-4 mt-6 text-center">
        <h1 className="text-2xl font-extrabold text-ink-900">
          {mapView.materialTitle}
        </h1>
      </div>
      <MapPath map={mapView} />
    </div>
  );
}
