"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/game/store";

export function GameStateSync({
  xpTotal,
  streakDays,
}: {
  xpTotal: number;
  streakDays: number;
}) {
  const syncFromServer = useGameStore((s) => s.syncFromServer);

  useEffect(() => {
    syncFromServer({ xpTotal, streakDays });
  }, [xpTotal, streakDays, syncFromServer]);

  return null;
}
