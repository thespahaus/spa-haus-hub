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

// The Spa Haus Google Ads account runs on Eastern time (Garner, NC). Call
// timestamps are stored as correct UTC instants, so always render them back in
// Eastern for display — matching what Matt sees in the Google Ads UI.
const EASTERN = "America/New_York"

export function formatEasternDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: EASTERN,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

// Campaign-day dates are stored as UTC-midnight (date-only), so format in UTC.
export function formatUtcDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
