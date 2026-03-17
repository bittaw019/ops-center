import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function safeNumber(value: number | null | undefined, fallback = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
}
