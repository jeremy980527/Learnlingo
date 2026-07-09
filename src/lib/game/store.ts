"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const DEFAULT_MAX_HEARTS = 5;
const HEART_REFILL_MINUTES = 30;

interface GameState {
  hearts: number;
  maxHearts: number;
  nextHeartAt: number | null;
  xpTotal: number;
  streakDays: number;
  loseHeart: () => boolean;
  refillAllHearts: () => void;
  tickHeartRegeneration: () => void;
  gainXp: (amount: number) => void;
  syncFromServer: (data: { xpTotal: number; streakDays: number }) => void;
  resetProgress: () => void;
}

const initialState = {
  hearts: DEFAULT_MAX_HEARTS,
  maxHearts: DEFAULT_MAX_HEARTS,
  nextHeartAt: null as number | null,
  xpTotal: 0,
  streakDays: 0,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      loseHeart: () => {
        const { hearts, nextHeartAt } = get();
        if (hearts <= 0) return false;
        const nextHearts = hearts - 1;
        set({
          hearts: nextHearts,
          nextHeartAt:
            nextHeartAt ?? Date.now() + HEART_REFILL_MINUTES * 60 * 1000,
        });
        return nextHearts > 0;
      },

      refillAllHearts: () => {
        set((state) => ({ hearts: state.maxHearts, nextHeartAt: null }));
      },

      tickHeartRegeneration: () => {
        const { hearts, maxHearts, nextHeartAt } = get();
        if (hearts >= maxHearts || nextHeartAt === null) return;
        if (Date.now() >= nextHeartAt) {
          const nextHearts = Math.min(maxHearts, hearts + 1);
          set({
            hearts: nextHearts,
            nextHeartAt:
              nextHearts >= maxHearts
                ? null
                : Date.now() + HEART_REFILL_MINUTES * 60 * 1000,
          });
        }
      },

      gainXp: (amount) => {
        set((state) => ({ xpTotal: state.xpTotal + amount }));
      },

      syncFromServer: ({ xpTotal, streakDays }) => {
        set({ xpTotal, streakDays });
      },

      resetProgress: () => set({ ...initialState }),
    }),
    {
      name: "duolearn-game-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hearts: state.hearts,
        maxHearts: state.maxHearts,
        nextHeartAt: state.nextHeartAt,
      }),
    },
  ),
);
