"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/game/store";

function formatCountdown(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function HeartsStatusCard() {
  const hearts = useGameStore((s) => s.hearts);
  const maxHearts = useGameStore((s) => s.maxHearts);
  const nextHeartAt = useGameStore((s) => s.nextHeartAt);
  const tickHeartRegeneration = useGameStore((s) => s.tickHeartRegeneration);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    tickHeartRegeneration();
    const interval = setInterval(() => {
      tickHeartRegeneration();
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [tickHeartRegeneration]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>生命值</CardTitle>
        <CardDescription>答錯題目會扣除生命值，會隨時間慢慢恢復</CardDescription>
      </CardHeader>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: maxHearts }).map((_, index) => (
          <Heart
            key={index}
            size={28}
            className={index < hearts ? "fill-red-500 text-red-500" : "text-ink-200"}
          />
        ))}
      </div>

      {hearts < maxHearts && nextHeartAt ? (
        <p className="mt-3 text-sm font-semibold text-ink-500">
          下一顆生命值將在 {formatCountdown(nextHeartAt - now)} 後恢復
        </p>
      ) : (
        <p className="mt-3 text-sm font-semibold text-primary-600">
          生命值已滿！
        </p>
      )}
    </Card>
  );
}
