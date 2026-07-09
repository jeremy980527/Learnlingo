import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide",
  {
    variants: {
      variant: {
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-secondary-100 text-secondary-700",
        gold: "bg-gold-100 text-gold-600",
        red: "bg-red-100 text-red-600",
        neutral: "bg-ink-200 text-ink-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
