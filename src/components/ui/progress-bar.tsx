"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  trackClassName,
  indicatorClassName,
  label,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      {label ? (
        <span className="text-xs font-bold uppercase tracking-wide text-ink-500">
          {label}
        </span>
      ) : null}
      <ProgressPrimitive.Root
        value={percentage}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-ink-200",
          trackClassName,
        )}
      >
        <ProgressPrimitive.Indicator asChild>
          <motion.div
            className={cn(
              "h-full rounded-full bg-primary-500",
              indicatorClassName,
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </div>
  );
}
