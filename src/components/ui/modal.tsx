"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl",
                  className,
                )}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              >
                {title ? (
                  <Dialog.Title className="text-xl font-extrabold text-ink-900">
                    {title}
                  </Dialog.Title>
                ) : (
                  <Dialog.Title className="sr-only">對話框</Dialog.Title>
                )}
                {description ? (
                  <Dialog.Description className="mt-1 text-sm font-medium text-ink-500">
                    {description}
                  </Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">
                    對話框內容
                  </Dialog.Description>
                )}
                <div className="mt-4">{children}</div>
                {showCloseButton && (
                  <Dialog.Close asChild>
                    <button
                      className="absolute right-4 top-4 rounded-full p-1.5 text-ink-300 transition-colors hover:bg-ink-100 hover:text-ink-700"
                      aria-label="關閉"
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
