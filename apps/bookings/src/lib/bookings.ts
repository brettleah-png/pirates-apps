// Bookings, read from the "Form responses 1" tab that the Google Form fills in
import { createHash } from "node:crypto";
import {
  minutesFromTime,
  parseDate,
  parseTime,
  timeFromMinutes,
  timeInDate,
} from "./dates";

export const RESPONSES_TAB = "Form responses 1";

export interface Booking {
  /**
   * Used in links to the booking. Made from the submission time and email,
   * which never change, so it survives sorting the sheet. It doesn't reveal
   * the email.
   */
  id: string;
  /**
   * The form's Timestamp cell exactly as stored. It identifies the booking
   * in the "Tracking Data" and "History" tabs.
   */
  timestampKey: string;
  /** When the form was sent, as "2026-09-11" and "18:02" */
  submittedDate: string | null;
  submittedTime: string | null;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  functionType: string;
  /** "2026-10-31", or null when the answer is missing or unreadable */
  date: string | null;
  /** "18:00", or null when unknown */
  startTime: string | null;
  endTime: string | null;
  /** True when the function ends after midnight, on the next day */
  endsNextDay: boolean;
  isMember: boolean;
  acceptedTerms: boolean;
  specialConsiderations: string;
}

// Each column is found by the start of its header's first line. The form's
// headers carry the question's help text on later lines.
const HEADERS = {
  timestamp: "timestamp",
  email: "email address",
  name: "name and surname",
  functionType: "type of function",
  date: "date of function",
  phone: "cell number",
  idNumber: "id number",
  acceptedTerms: "do you accept the terms",
  startTime: "start time",
  endTime: "end time",
  specialConsiderations: "(optional) special considerations",
  isMember: "are you a registered member",
} as const;

type Column = keyof typeof HEADERS;

// Without these two, bookings can't be told apart
const REQUIRED_COLUMNS: Column[] = ["timestamp", "email"];

function headerFirstLine(header: unknown): string {
  return String(header ?? "")
    .split("\n")[0]
    .trim()
    .toLowerCase();
}

function findColumns(headerRow: unknown[]): Record<Column, number> {
  const headers = headerRow.map(headerFirstLine);
  const columns = {} as Record<Column, number>;
  for (const [column, start] of Object.entries(HEADERS) as [Column, string][]) {
    columns[column] = headers.findIndex((header) => header.startsWith(start));
  }
  for (const column of REQUIRED_COLUMNS) {
    if (columns[column] === -1) {
      throw new Error(
        `The "${RESPONSES_TAB}" tab has no "${HEADERS[column]}" column`
      );
    }
  }
  return columns;
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function isBlank(value: unknown): boolean {
  return text(value) === "";
}

/**
 * Phone numbers are usually text, but a cell that became a number loses its
 * leading 0 (0711111111 becomes 711111111), so put it back.
 */
function phoneNumber(value: unknown): string {
  if (typeof value === "number") {
    const digits = String(value);
    return digits.length === 9 ? `0${digits}` : digits;
  }
  return text(value);
}

/**
 * SA ID numbers have 13 digits. As a number, an ID starting with 0 (born
 * 2000–2009) loses that 0, so pad it back.
 */
function idNumber(value: unknown): string {
  if (typeof value === "number") {
    return String(value).padStart(13, "0");
  }
  return text(value);
}

/**
 * A Timestamp cell as text, for matching it across tabs. The app copies the
 * raw number into App_Timestamp, so the two always compare equal.
 */
export function timestampKey(value: unknown): string {
  return typeof value === "number" ? String(value) : text(value);
}

function bookingId(timestamp: unknown, email: string): string {
  return createHash("sha256")
    .update(`${String(timestamp)}|${email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 12);
}

/**
 * Two versions of the form wrote different things into the same columns:
 *
 * - Older rows: "Date of Function" holds the date and start time, Start Time
 *   is empty, and End Time holds the number of hours booked.
 * - Newer rows: "Date of Function" holds only the date, and Start Time and
 *   End Time hold times of day.
 */
function functionTimes(
  dateValue: unknown,
  startValue: unknown,
  endValue: unknown
): Pick<Booking, "date" | "startTime" | "endTime" | "endsNextDay"> {
  const date = parseDate(dateValue);
  let startTime: string | null;
  let endTime: string | null = null;

  if (!isBlank(startValue)) {
    startTime = parseTime(startValue);
    endTime = parseTime(endValue);
  } else {
    startTime = timeInDate(dateValue);
    const hours = Number(endValue);
    if (
      startTime &&
      !isBlank(endValue) &&
      Number.isFinite(hours) &&
      hours > 0
    ) {
      endTime = timeFromMinutes(
        minutesFromTime(startTime) + Math.round(hours * 60)
      );
    }
  }

  const endsNextDay =
    startTime !== null &&
    endTime !== null &&
    minutesFromTime(endTime) < minutesFromTime(startTime);
  return { date, startTime, endTime, endsNextDay };
}

/** Every booking in the responses tab's rows (header row first). Blank rows are skipped. */
export function parseBookings(rows: unknown[][]): Booking[] {
  const [headerRow = [], ...dataRows] = rows;
  const columns = findColumns(headerRow);
  const cell = (row: unknown[], column: Column) =>
    columns[column] === -1 ? undefined : row[columns[column]];

  return dataRows
    .filter((row) => !isBlank(cell(row, "timestamp")))
    .map((row) => {
      const timestamp = cell(row, "timestamp");
      const email = text(cell(row, "email"));
      return {
        id: bookingId(timestamp, email),
        timestampKey: timestampKey(timestamp),
        submittedDate: parseDate(timestamp),
        submittedTime: timeInDate(timestamp),
        name: text(cell(row, "name")).replace(/\s+/g, " "),
        email,
        phone: phoneNumber(cell(row, "phone")),
        idNumber: idNumber(cell(row, "idNumber")),
        functionType: text(cell(row, "functionType")),
        ...functionTimes(
          cell(row, "date"),
          cell(row, "startTime"),
          cell(row, "endTime")
        ),
        isMember: text(cell(row, "isMember")).toLowerCase() === "yes",
        acceptedTerms: !isBlank(cell(row, "acceptedTerms")),
        specialConsiderations: text(cell(row, "specialConsiderations")),
      };
    });
}

/** "071 111 1111" for a South African mobile number, or the number as typed */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (/^0\d{9}$/.test(digits)) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

/** How long the function runs, in minutes, or null when a time is unknown */
export function durationInMinutes(booking: Booking): number | null {
  if (!booking.startTime || !booking.endTime) {
    return null;
  }
  const minutes =
    minutesFromTime(booking.endTime) - minutesFromTime(booking.startTime);
  return booking.endsNextDay ? minutes + 24 * 60 : minutes;
}

/** "18:00 – 01:00", "From 18:00", or null when the start time is unknown */
export function timeRange(booking: Booking): string | null {
  if (!booking.startTime) {
    return null;
  }
  return booking.endTime
    ? `${booking.startTime} – ${booking.endTime}`
    : `From ${booking.startTime}`;
}

/** "7 hours", "1 hour", "4 h 30 min" */
export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return hours === 0 ? `${mins} min` : `${hours} h ${mins} min`;
}

/**
 * Where a booking's ID number is in the responses tab's rows, as a sheet row
 * (1 is the header row) and column (0 is A). Null if the booking isn't there.
 */
export function idNumberCell(
  rows: unknown[][],
  bookingKey: string
): { row: number; column: number } | null {
  const [headerRow = [], ...dataRows] = rows;
  const columns = findColumns(headerRow);
  if (columns.idNumber === -1) {
    return null;
  }
  const index = dataRows.findIndex(
    (row) => timestampKey(row[columns.timestamp]) === bookingKey
  );
  return index === -1 ? null : { row: index + 2, column: columns.idNumber };
}
