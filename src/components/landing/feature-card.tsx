"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLOR_CLASSES = {
  primary: "bg-primary-100 text-primary-600",
  secondary: "bg-secondary-100 text-secondary-600",
  gold: "bg-gold-100 text-gold-600",
  red: "bg-red-100 text-red-600",
  purple: "bg-purple-300/40 text-purple-600",
} as const;

export function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  color: keyof typeof COLOR_CLASSES;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            COLOR_CLASSES[color],
          )}
        >
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-ink-900">{title}</h3>
        <p className="mt-1 text-sm font-medium text-ink-500">{description}</p>
      </Card>
    </motion.div>
  );
}
