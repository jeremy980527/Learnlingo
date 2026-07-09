const OFFSET_PATTERN = [0, 70, 0, -70];
const ROW_HEIGHT = 116;
const CENTER_X = 180;

export function offsetForIndex(index: number) {
  return OFFSET_PATTERN[index % OFFSET_PATTERN.length];
}

export function UnitPathSvg({ lessonCount }: { lessonCount: number }) {
  if (lessonCount <= 1) return null;

  const points = Array.from({ length: lessonCount }, (_, i) => ({
    x: CENTER_X + offsetForIndex(i),
    y: 58 + i * ROW_HEIGHT,
  }));

  const pathD = points
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
      width={360}
      height={lessonCount * ROW_HEIGHT}
      viewBox={`0 0 360 ${lessonCount * ROW_HEIGHT}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={pathD}
        stroke="var(--color-ink-200)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="2 22"
      />
    </svg>
  );
}

export { ROW_HEIGHT };
