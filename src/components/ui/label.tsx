import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-extrabold uppercase tracking-wide text-ink-500",
        className,
      )}
      {...props}
    />
  );
}
