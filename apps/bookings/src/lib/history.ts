// Each booking's history, in the "History" tab: notes people add, and a line
// for every save ("Payment status: None → Deposit Paid."). The app owns the
// tab and adds a row per entry.
import { randomBytes } from "node:crypto";
import { timestampKey } from "./bookings";

export const HISTORY_TAB = "History";

/** Authors can edit or delete their own note for this long after adding it */
export const NOTE_CHANGE_MINUTES = 10;

export const HISTORY_COLUMNS = {
  id: "App_Id",
  timestamp: "App_Timestamp",
  at: "App_At",
  by: "App_By",
  type: "App_Type",
  text: "App_Text",
  editedAt: "App_EditedAt",
} as const;

export type HistoryColumn = keyof typeof HISTORY_COLUMNS;

export interface HistoryEntry {
  id: string;
  /** The booking's timestamp */
  bookingKey: string;
  /** When it was added, as a Sheets date-and-time number */
  at: number;
  /** The email address of whoever added it */
  by: string;
  type: "note" | "change";
  text: string;
  /** When a note was last edited, or null */
  editedAt: number | null;
  /** Its row in the tab (1 is the header row) */
  row: number;
}

export interface HistoryTab {
  columns: Record<HistoryColumn, number>;
  entries: HistoryEntry[];
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function number(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

/** Reads the "History" tab's rows (header row first). Blank rows are skipped. */
export function parseHistoryTab(rows: unknown[][]): HistoryTab {
  const [headerRow = [], ...dataRows] = rows;
  const headers = headerRow.map((header) => text(header).toLowerCase());

  const columns = {} as Record<HistoryColumn, number>;
  for (const [column, header] of Object.entries(HISTORY_COLUMNS) as [
    HistoryColumn,
    string,
  ][]) {
    columns[column] = headers.indexOf(header.toLowerCase());
    if (columns[column] === -1) {
      throw new Error(`The "${HISTORY_TAB}" tab has no "${header}" column`);
    }
  }

  const entries: HistoryEntry[] = [];
  dataRows.forEach((row, index) => {
    const id = text(row[columns.id]);
    if (!id) {
      return;
    }
    entries.push({
      id,
      bookingKey: timestampKey(row[columns.timestamp]),
      at: number(row[columns.at]) ?? 0,
      by: text(row[columns.by]),
      type: text(row[columns.type]) === "change" ? "change" : "note",
      text: text(row[columns.text]),
      editedAt: number(row[columns.editedAt]),
      row: index + 2,
    });
  });
  return { columns, entries };
}

/** A booking's history, newest first */
export function historyFor(
  entries: HistoryEntry[],
  bookingKey: string
): HistoryEntry[] {
  return entries
    .filter((entry) => entry.bookingKey === bookingKey)
    .sort((a, b) => b.at - a.at);
}

/** Only the author can edit or delete a note, and only for 10 minutes */
export function canChangeNote(
  entry: HistoryEntry,
  email: string,
  now: number
): boolean {
  // Whole seconds, so rounding in the date arithmetic can't make exactly
  // 10 minutes count as too late
  const secondsSinceAdded = Math.round((now - entry.at) * 24 * 60 * 60);
  return (
    entry.type === "note" &&
    entry.by.toLowerCase() === email.toLowerCase() &&
    secondsSinceAdded <= NOTE_CHANGE_MINUTES * 60
  );
}

/** A short random ID for a new entry, so a note can be found again to edit or delete */
export function newEntryId(): string {
  return randomBytes(6).toString("hex");
}

/** A new entry's cells, in the tab's column order */
export function historyRow(
  columns: Record<HistoryColumn, number>,
  entry: Omit<HistoryEntry, "row" | "editedAt" | "bookingKey"> & {
    bookingKey: unknown;
  }
): unknown[] {
  const row: unknown[] = new Array(
    Math.max(...Object.values(columns)) + 1
  ).fill("");
  row[columns.id] = entry.id;
  row[columns.timestamp] = entry.bookingKey;
  row[columns.at] = entry.at;
  row[columns.by] = entry.by;
  row[columns.type] = entry.type;
  row[columns.text] = entry.text;
  return row;
}
