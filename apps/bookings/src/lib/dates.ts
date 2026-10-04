// Dates and times from Google Sheets, and "today" in South Africa.
//
// The Sheets API returns a date as the number of days since 30 December 1899,
// and a time as a fraction of a day (0.75 is 18:00). Both are wall-clock time
// in South Africa, with no time zone attached. So the app keeps them as plain
// text, dates as "2026-10-31" and times as "18:00", and no time zone
// conversion can shift them.

const SHEETS_FIRST_DAY_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MINUTES_PER_DAY = 24 * 60;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === "";
}

/** "2026-10-31" from a Sheets date number. Any time of day is ignored. */
export function dateFromSerial(serial: number): string {
  const days = Math.floor(serial);
  return new Date(SHEETS_FIRST_DAY_MS + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/** "18:00" from the time-of-day part of a Sheets number, to the nearest minute */
export function timeFromSerial(serial: number): string {
  const fractionOfDay = serial - Math.floor(serial);
  return timeFromMinutes(Math.round(fractionOfDay * MINUTES_PER_DAY));
}

/** "01:00" from minutes after midnight. Times past midnight wrap around. */
export function timeFromMinutes(minutes: number): string {
  const sinceMidnight =
    ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(sinceMidnight / 60);
  const mins = sinceMidnight % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Minutes after midnight from "18:00" */
export function minutesFromTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * The date from a cell: a Sheets date number, or text like "31/10/2026"
 * (South African day/month order). Null when it's blank or unreadable.
 */
export function parseDate(value: unknown): string | null {
  if (typeof value === "number") {
    return dateFromSerial(value);
  }
  const match = String(value ?? "").match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) {
    return null;
  }
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * The time of day from a cell: a Sheets time or date-and-time number, or text
 * like "18:00" or "18:00:00". Null when it's blank or unreadable.
 */
export function parseTime(value: unknown): string | null {
  if (typeof value === "number") {
    return timeFromSerial(value);
  }
  const match = String(value ?? "").match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }
  return timeFromMinutes(Number(match[1]) * 60 + Number(match[2]));
}

/**
 * The time of day stored in a date cell, if it has one. A whole number, or a
 * date typed without a time, has none.
 */
export function timeInDate(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isInteger(value) ? null : timeFromSerial(value);
  }
  if (isBlank(value) || !String(value).includes(":")) {
    return null;
  }
  return parseTime(value);
}

/** Today's date in South Africa as "2026-10-31". Netlify's servers run on UTC. */
export function todayInSouthAfrica(now: Date = new Date()): string {
  // The en-CA locale writes dates as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Formats a "2026-10-31" date. Formatting it as UTC midnight keeps the day
// from shifting.
function formatDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-ZA", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** "Sat" */
export function weekdayShort(date: string): string {
  return formatDate(date, { weekday: "short" });
}

/** "31" */
export function dayOfMonth(date: string): string {
  return String(Number(date.slice(8, 10)));
}

/** "Oct" */
export function monthShort(date: string): string {
  return formatDate(date, { month: "short" });
}

/** "October 2026" */
export function monthAndYear(date: string): string {
  return formatDate(date, { month: "long", year: "numeric" });
}

/** "Saturday 31 October 2026" */
export function longDate(date: string): string {
  const weekday = formatDate(date, { weekday: "long" });
  return `${weekday} ${dayOfMonth(date)} ${formatDate(date, { month: "long" })} ${date.slice(0, 4)}`;
}

/** "11 Sep 2026" */
export function shortDate(date: string): string {
  return `${dayOfMonth(date)} ${monthShort(date)} ${date.slice(0, 4)}`;
}

/** Whole days from today to the date: 0 is today, -1 yesterday */
export function daysFromToday(date: string, today: string): number {
  const toUtc = (d: string) =>
    Date.UTC(
      Number(d.slice(0, 4)),
      Number(d.slice(5, 7)) - 1,
      Number(d.slice(8, 10))
    );
  return Math.round((toUtc(date) - toUtc(today)) / MS_PER_DAY);
}

/** "Today", "Tomorrow", "In 12 days", "Yesterday", "3 days ago" */
export function relativeDay(date: string, today: string): string {
  const days = daysFromToday(date, today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
}
