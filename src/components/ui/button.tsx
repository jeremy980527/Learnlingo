"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-extrabold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-white shadow-[0_4px_0_0_var(--color-primary-600)] hover:bg-primary-400 focus-visible:ring-primary-300 disabled:shadow-[0_4px_0_0_var(--color-ink-300)]",
        secondary:
          "bg-secondary-500 text-white shadow-[0_4px_0_0_var(--color-secondary-600)] hover:bg-secondary-500/90 focus-visible:ring-secondary-300",
        danger:
          "bg-red-500 text-white shadow-[0_4px_0_0_var(--color-red-600)] hover:bg-red-500/90 focus-visible:ring-red-300",
        outline:
          "border-2 border-ink-200 bg-white text-ink-700 shadow-[0_4px_0_0_var(--color-ink-200)] hover:bg-ink-100 focus-visible:ring-ink-200",
        ghost:
          "bg-transparent text-ink-500 shadow-none hover:bg-ink-200/60 focus-visible:ring-ink-200",
        gold: "bg-gold-500 text-white shadow-[0_4px_0_0_var(--color-gold-600)] hover:bg-gold-500/90 focus-visible:ring-gold-300",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11 rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      const Comp = Slot;
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        whileTap={{ y: 4, boxShadow: "0 0 0 0 transparent" }}
        transition={{ duration: 0.1 }}
        onClick={onClick}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <motion.span
            className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
          />
        ) : null}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
