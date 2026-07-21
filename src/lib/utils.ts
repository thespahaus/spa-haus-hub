import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Due dates are stored as UTC-midnight from a plain <input type="date">
// value with no meaningful time component. Formatting in UTC keeps the
// displayed date matching what was typed, regardless of server/browser timezone.
export function formatDueDate(date: Date) {
  return date.toLocaleDateString(undefined, { timeZone: "UTC" })
}
