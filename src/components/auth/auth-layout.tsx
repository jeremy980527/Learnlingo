"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-2xl font-black text-primary-600"
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="fill-primary-500 text-primary-500" size={28} />
          </motion.span>
          DuoLearn
        </Link>

        <div className="rounded-3xl border-2 border-ink-200 bg-white p-8 shadow-[0_4px_0_0_var(--color-ink-200)]">
          <h1 className="text-center text-2xl font-extrabold text-ink-900">
            {title}
          </h1>
          <p className="mt-1 text-center text-sm font-medium text-ink-500">
            {subtitle}
          </p>

          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-6 text-center text-sm font-semibold text-ink-500">
          {footer}
        </div>
      </motion.div>
    </div>
  );
}
