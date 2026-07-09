import type { GeneratedUnit } from "@/lib/validations/learning-map";
import { cn } from "@/lib/utils";

const THEME_BG: Record<GeneratedUnit["colorTheme"], string> = {
  primary: "bg-primary-500",
  secondary: "bg-secondary-500",
  gold: "bg-gold-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
};

export function UnitBanner({
  title,
  description,
  colorTheme,
}: {
  title: string;
  description?: string;
  colorTheme: GeneratedUnit["colorTheme"];
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col gap-1 rounded-2xl px-5 py-4 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)]",
        THEME_BG[colorTheme],
      )}
    >
      <p className="text-lg font-extrabold">{title}</p>
      {description ? (
        <p className="text-sm font-medium opacity-90">{description}</p>
      ) : null}
    </div>
  );
}
