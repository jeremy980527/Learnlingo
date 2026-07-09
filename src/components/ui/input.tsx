import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1.5">
        <input
          ref={ref}
          className={cn(
            "h-12 w-full rounded-2xl border-2 border-ink-200 bg-white px-4 text-sm font-semibold text-ink-900 outline-none transition-colors placeholder:font-medium placeholder:text-ink-300 focus:border-secondary-500",
            error && "border-red-500 focus:border-red-500",
            className,
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs font-bold text-red-500">{error}</span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
