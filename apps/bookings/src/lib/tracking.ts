// What the committee tracks for each booking, in the "Tracking Data" tab.
//
// "Tracking Data" copies "Form responses 1" row by row with a formula, and
// the app's App_ columns sit beside the copy: row 5's App_ values belong to
// the booking copied into row 5. Rows only stay lined up while nobody sorts
// or deletes rows in "Form responses 1". So when the app saves a row, it also
// writes the booking's timestamp into App_Timestamp. If that stops matching
// the copied Timestamp beside it, the row is "out of line": the app still
// shows the right values (it matches them by App_Timestamp), but it won't
// save anything until someone fixes the tab.
import type { Booking } from "./bookings";
import { timestampKey } from "./bookings";
import type { Permission, Permissions } from "./users";

export const TRACKING_TAB = "Tracking Data";

// "as const" makes these fixed lists, so a form can only send one of them
export const BOOKING_STATUSES = [
  "New",
  "Client Contacted",
  "Cancelled",
] as const;
export const PAYMENT_STATUSES = [
  "None",
  "Invoice Sent",
  "Deposit Paid",
  "Full Payment Received",
  "Refunded",
] as const;
export const DAMAGE_DEPOSIT_STATUSES = [
  "Outstanding",
  "Paid",
  "Refunded",
  "Not required",
] as const;

export interface Tracking {
  status: string;
  paymentStatus: string;
  invoiceNumber: string;
  damageDeposit: string;
  /** Rand kept back from the damage deposit, as typed */
  damageKeptBack: string;
  /** What was damaged */
  damageNote: string;
  /** Who last saved it, and when (a Sheets date-and-time number). Empty until saved. */
  updatedBy: string;
  updatedAt: number | null;
}

/** What a booking shows until someone saves something for it */
export const DEFAULT_TRACKING: Tracking = {
  status: "New",
  paymentStatus: "None",
  invoiceNumber: "",
  damageDeposit: "Outstanding",
  damageKeptBack: "",
  damageNote: "",
  updatedBy: "",
  updatedAt: null,
};

/** The app's columns. It ignores every other column except the copied Timestamp. */
export const TRACKING_COLUMNS = {
  timestamp: "App_Timestamp",
  status: "App_Status",
  paymentStatus: "App_PaymentStatus",
  invoiceNumber: "App_InvoiceNumber",
  damageDeposit: "App_DamageDeposit",
  damageKeptBack: "App_DamageKeptBack",
  damageNote: "App_DamageNote",
  updatedBy: "App_UpdatedBy",
  updatedAt: "App_UpdatedAt",
} as const;

export type TrackingColumn = keyof typeof TRACKING_COLUMNS;

export interface TrackingTab {
  /** Where each App_ column is (0 is column A) */
  columns: Record<TrackingColumn, number>;
  /** Saved values, by booking timestamp */
  byTimestamp: Map<string, Tracking>;
  /** The sheet row (1 is the header row) of each booking's copied row, by timestamp */
  rowByTimestamp: Map<string, number>;
  /** Sheet rows whose App_Timestamp no longer matches the copied Timestamp */
  outOfLineRows: number[];
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function readTracking(
  row: unknown[],
  columns: Record<TrackingColumn, number>
): Tracking {
  const value = (column: TrackingColumn) => text(row[columns[column]]);
  return {
    status: value("status") || DEFAULT_TRACKING.status,
    paymentStatus: value("paymentStatus") || DEFAULT_TRACKING.paymentStatus,
    invoiceNumber: value("invoiceNumber"),
    damageDeposit: value("damageDeposit") || DEFAULT_TRACKING.damageDeposit,
    damageKeptBack: value("damageKeptBack"),
    damageNote: value("damageNote"),
    updatedBy: value("updatedBy"),
    updatedAt:
      typeof row[columns.updatedAt] === "number"
        ? (row[columns.updatedAt] as number)
        : null,
  };
}

function hasAnyValue(
  row: unknown[],
  columns: Record<TrackingColumn, number>
): boolean {
  return (Object.keys(TRACKING_COLUMNS) as TrackingColumn[]).some(
    (column) => text(row[columns[column]]) !== ""
  );
}

/** Reads the "Tracking Data" tab's rows (header row first) */
export function parseTrackingTab(rows: unknown[][]): TrackingTab {
  const [headerRow = [], ...dataRows] = rows;
  const headers = headerRow.map((header) => text(header));

  const columns = {} as Record<TrackingColumn, number>;
  for (const [column, header] of Object.entries(TRACKING_COLUMNS) as [
    TrackingColumn,
    string,
  ][]) {
    columns[column] = headers.findIndex(
      (h) => h.toLowerCase() === header.toLowerCase()
    );
    if (columns[column] === -1) {
      throw new Error(`The "${TRACKING_TAB}" tab has no "${header}" column`);
    }
  }
  const copiedTimestampColumn = headers.findIndex(
    (h) => h.split("\n")[0].trim().toLowerCase() === "timestamp"
  );
  if (copiedTimestampColumn === -1) {
    throw new Error(
      `The "${TRACKING_TAB}" tab has no "Timestamp" column. It should copy "Form responses 1".`
    );
  }

  const byTimestamp = new Map<string, Tracking>();
  const rowByTimestamp = new Map<string, number>();
  const outOfLineRows: number[] = [];
  dataRows.forEach((row, index) => {
    const sheetRow = index + 2;
    const copied = timestampKey(row[copiedTimestampColumn]);
    const saved = timestampKey(row[columns.timestamp]);
    if (copied) {
      rowByTimestamp.set(copied, sheetRow);
    }
    if (!hasAnyValue(row, columns)) {
      return;
    }
    if (saved && saved !== copied) {
      outOfLineRows.push(sheetRow);
    }
    // Values typed by hand without an App_Timestamp belong to the row's
    // copied booking
    const owner = saved || copied;
    if (owner) {
      byTimestamp.set(owner, readTracking(row, columns));
    }
  });

  return { columns, byTimestamp, rowByTimestamp, outOfLineRows };
}

/** A booking together with what's tracked for it */
export interface TrackedBooking extends Booking {
  tracking: Tracking;
}

export function withTracking(
  bookings: Booking[],
  tab: TrackingTab
): TrackedBooking[] {
  return bookings.map((booking) => ({
    ...booking,
    tracking: tab.byTimestamp.get(booking.timestampKey) ?? DEFAULT_TRACKING,
  }));
}

/** A booking holds its date once the deposit or full payment is in, unless it's cancelled */
export function isConfirmed(tracking: Tracking): boolean {
  return (
    tracking.status !== "Cancelled" &&
    (tracking.paymentStatus === "Deposit Paid" ||
      tracking.paymentStatus === "Full Payment Received")
  );
}

/** Other confirmed bookings on the same date */
export function clashesWith(
  booking: TrackedBooking,
  all: TrackedBooking[]
): TrackedBooking[] {
  if (!booking.date) {
    return [];
  }
  return all.filter(
    (other) =>
      other.id !== booking.id &&
      other.date === booking.date &&
      isConfirmed(other.tracking)
  );
}

// Who may change each field
const FIELD_PERMISSIONS = {
  status: "notesAndStatus",
  paymentStatus: "payments",
  invoiceNumber: "payments",
  damageDeposit: "payments",
  damageKeptBack: "payments",
  damageNote: "payments",
} as const satisfies Record<string, Permission>;

export type EditableField = keyof typeof FIELD_PERMISSIONS;

export const FIELD_LABELS: Record<EditableField, string> = {
  status: "Status",
  paymentStatus: "Payment status",
  invoiceNumber: "Invoice number",
  damageDeposit: "Damage deposit",
  damageKeptBack: "Amount kept back",
  damageNote: "Damage",
};

/** The fields this person may change */
export function editableFields(permissions: Permissions): EditableField[] {
  return (Object.keys(FIELD_PERMISSIONS) as EditableField[]).filter(
    (field) => permissions[FIELD_PERMISSIONS[field]]
  );
}

/**
 * What a save changes: only fields the person may change, and only ones they
 * actually changed in the form. So two people editing different fields at
 * the same time don't undo each other's work.
 */
export function changesToSave(
  shownInForm: Tracking,
  submitted: Partial<Record<EditableField, string>>,
  permissions: Permissions
): Partial<Record<EditableField, string>> {
  const changes: Partial<Record<EditableField, string>> = {};
  for (const field of editableFields(permissions)) {
    const value = submitted[field]?.trim();
    if (value !== undefined && value !== shownInForm[field]) {
      changes[field] = value;
    }
  }
  return changes;
}

/** "Status: New → Client Contacted. Payment status: None → Deposit Paid." */
export function describeChanges(
  before: Tracking,
  changes: Partial<Record<EditableField, string>>
): string {
  return (Object.keys(changes) as EditableField[])
    .map(
      (field) =>
        `${FIELD_LABELS[field]}: ${before[field] || "—"} → ${changes[field] || "—"}.`
    )
    .join(" ");
}

/**
 * The club keeps ID numbers until the damage deposit is settled: the
 * function is over and the deposit is refunded or wasn't needed. A cancelled
 * booking doesn't need it either.
 */
export function canDeleteIdNumber(
  booking: TrackedBooking,
  today: string
): boolean {
  if (!booking.idNumber) {
    return false;
  }
  if (booking.tracking.status === "Cancelled") {
    return true;
  }
  const isOver = booking.date !== null && booking.date < today;
  const isSettled =
    booking.tracking.damageDeposit === "Refunded" ||
    booking.tracking.damageDeposit === "Not required";
  return isOver && isSettled;
}
