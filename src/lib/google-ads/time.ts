// The Google Ads account's time zone (Garner, NC). call_view timestamps come
// back as wall-clock strings in this zone with no offset, so we convert them
// to a correct UTC instant for storage and format back to this zone for
// display. DST-aware (EDT = -4 in summer, EST = -5 in winter), which matters
// because the synced history spans both.
export const ACCOUNT_TIME_ZONE = "America/New_York";

/**
 * Interpret a "YYYY-MM-DD HH:MM:SS" wall-clock string as ACCOUNT_TIME_ZONE and
 * return the correct UTC instant, accounting for DST at that date.
 */
export function accountWallClockToUtc(s: string): Date | null {
  const [datePart, timePart = "00:00:00"] = s.trim().split(/[ T]/);
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi, sec] = timePart.split(":").map(Number);
  if ([y, mo, d, h, mi, sec].some((n) => Number.isNaN(n))) return null;

  // Treat the parts as if UTC, then measure how far ACCOUNT_TIME_ZONE is from
  // UTC at that instant and subtract it out.
  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi, sec);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ACCOUNT_TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(asIfUtc));

  const map: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = Number(p.value);
  // Intl may render midnight as hour "24"; normalize.
  const hour = map.hour === 24 ? 0 : map.hour;
  const zoneAsUtc = Date.UTC(map.year, map.month - 1, map.day, hour, map.minute, map.second);
  const offset = zoneAsUtc - asIfUtc;
  return new Date(asIfUtc - offset);
}
