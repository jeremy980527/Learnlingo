import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatXp(xp: number) {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${xp}`;
}

const idAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateId(prefix: string, length = 12) {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += idAlphabet[Math.floor(Math.random() * idAlphabet.length)];
  }
  return `${prefix}_${id}`;
}
