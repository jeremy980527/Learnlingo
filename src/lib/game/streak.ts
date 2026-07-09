function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const dateA = new Date(`${a}T00:00:00Z`);
  const dateB = new Date(`${b}T00:00:00Z`);
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeNextStreak(
  lastActiveAt: Date | null,
  currentStreakDays: number,
  now: Date = new Date(),
): number {
  const today = utcDateKey(now);

  if (!lastActiveAt) return 1;

  const lastActiveKey = utcDateKey(lastActiveAt);
  if (lastActiveKey === today) return currentStreakDays || 1;

  const diff = daysBetween(lastActiveKey, today);
  if (diff === 1) return currentStreakDays + 1;
  return 1;
}
