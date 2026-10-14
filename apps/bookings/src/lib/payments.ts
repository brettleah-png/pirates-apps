// Money received for a booking, and money paid back, in the "Payments" tab.
// The app owns the tab and adds a row per payment.
//
// Recording a payment moves the booking's payment status forward: Deposit
// Paid once half the invoice is in, Full Payment Received once all of it is.
// The damage deposit is paid with the invoice, so it counts as Paid once the
// whole invoice is. Nothing here moves a status back: Edit is there for that.
import { timestampKey } from "./bookings";
import { dateFromSerial, serialFromDate, shortDate } from "./dates";
import { formatRand } from "./invoices";

export const PAYMENTS_TAB = "Payments";

export const PAYMENT_KINDS = [
  "Payment",
  "Damage deposit refund",
  "Refund",
] as const;
export type PaymentKind = (typeof PAYMENT_KINDS)[number];

/** How each kind is named on screen */
export const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  Payment: "Payment received",
  "Damage deposit refund": "Damage deposit paid back",
  Refund: "Money paid back",
};

export interface Payment {
  id: string;
  /** The booking's timestamp */
  bookingKey: string;
  /** "2026-10-13": when the money went in or out */
  paidOn: string;
  kind: PaymentKind;
  /** Rand, always positive: the kind says which way the money went */
  amount: number;
  /** A bank reference or anything else worth knowing */
  note: string;
  /** The email address of whoever recorded it */
  recordedBy: string;
  /** Its row in the tab (1 is the header row) */
  row: number;
}

export const PAYMENT_COLUMNS = {
  id: "App_Id",
  timestamp: "App_Timestamp",
  paidOn: "App_PaidOn",
  kind: "App_Kind",
  amount: "App_Amount",
  note: "App_Note",
  recordedBy: "App_RecordedBy",
  recordedAt: "App_RecordedAt",
} as const;

export type PaymentColumn = keyof typeof PAYMENT_COLUMNS;

export interface PaymentsTab {
  columns: Record<PaymentColumn, number>;
  payments: Payment[];
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function parseKind(value: unknown): PaymentKind {
  const kind = text(value);
  return (PAYMENT_KINDS as readonly string[]).includes(kind)
    ? (kind as PaymentKind)
    : "Payment";
}

/** Reads the "Payments" tab's rows (header row first). Rows without an ID are skipped. */
export function parsePaymentsTab(rows: unknown[][]): PaymentsTab {
  const [headerRow = [], ...dataRows] = rows;
  const headers = headerRow.map((header) => text(header).toLowerCase());

  const columns = {} as Record<PaymentColumn, number>;
  for (const [column, header] of Object.entries(PAYMENT_COLUMNS) as [
    PaymentColumn,
    string,
  ][]) {
    columns[column] = headers.indexOf(header.toLowerCase());
    if (columns[column] === -1) {
      throw new Error(`The "${PAYMENTS_TAB}" tab has no "${header}" column`);
    }
  }

  const payments: Payment[] = [];
  dataRows.forEach((row, index) => {
    const id = text(row[columns.id]);
    if (!id) {
      return;
    }
    const paidOn = row[columns.paidOn];
    const amount = Number(row[columns.amount]);
    payments.push({
      id,
      bookingKey: timestampKey(row[columns.timestamp]),
      paidOn: typeof paidOn === "number" ? dateFromSerial(paidOn) : "",
      kind: parseKind(row[columns.kind]),
      amount: Number.isFinite(amount) ? amount : 0,
      note: text(row[columns.note]),
      recordedBy: text(row[columns.recordedBy]),
      row: index + 2,
    });
  });
  return { columns, payments };
}

/** A booking's payments, oldest first */
export function paymentsFor(
  payments: Payment[],
  bookingKey: string
): Payment[] {
  return payments
    .filter((payment) => payment.bookingKey === bookingKey)
    .sort((a, b) => a.paidOn.localeCompare(b.paidOn));
}

/** Rand received from the client, not counting anything paid back */
export function amountReceived(payments: Payment[]): number {
  return payments
    .filter((payment) => payment.kind === "Payment")
    .reduce((total, payment) => total + payment.amount, 0);
}

// The payment statuses on the way to being paid, in order. Refunded isn't
// one of them.
const PAYMENT_PROGRESS = [
  "None",
  "Invoice Sent",
  "Deposit Paid",
  "Full Payment Received",
];

/**
 * The payment status once this much of the invoice is in: Deposit Paid from
 * half, Full Payment Received from all of it. It only ever moves forward,
 * and leaves Refunded alone.
 */
export function paymentStatusAfterPayment(
  current: string,
  received: number,
  invoiceTotal: number
): string {
  const currentStep = PAYMENT_PROGRESS.indexOf(current);
  if (invoiceTotal <= 0 || currentStep === -1) {
    return current;
  }
  let reached = current;
  if (received >= invoiceTotal) {
    reached = "Full Payment Received";
  } else if (received >= invoiceTotal / 2) {
    reached = "Deposit Paid";
  }
  return PAYMENT_PROGRESS.indexOf(reached) > currentStep ? reached : current;
}

/** The damage deposit is part of the invoice, so it's Paid once the whole invoice is */
export function damageDepositAfterPayment(
  current: string,
  received: number,
  invoiceTotal: number
): string {
  const isFullyPaid = invoiceTotal > 0 && received >= invoiceTotal;
  return isFullyPaid && current === "Outstanding" ? "Paid" : current;
}

/**
 * What's kept back from the damage deposit when this much of it is paid
 * back, as the tracking stores it ("350"). Empty when nothing is kept back,
 * or when the invoice has no damage deposit to compare with.
 */
export function damageKeptBack(deposit: number, paidBack: number): string {
  const keptBack = deposit - paidBack;
  return keptBack > 0 ? String(keptBack) : "";
}

/** "Payment received: R 2,000.00 on 12 Oct 2026 (EFT ref SMITH)." */
export function describePayment(
  payment: Pick<Payment, "kind" | "amount" | "paidOn" | "note">
): string {
  const on = payment.paidOn ? ` on ${shortDate(payment.paidOn)}` : "";
  const note = payment.note ? ` (${payment.note})` : "";
  return `${PAYMENT_KIND_LABELS[payment.kind]}: ${formatRand(payment.amount)}${on}${note}.`;
}

/** A new payment's cells, in the tab's column order */
export function paymentRow(
  columns: Record<PaymentColumn, number>,
  payment: Omit<Payment, "row" | "bookingKey"> & {
    /** The booking's timestamp as the sheet stores it */
    bookingKey: unknown;
    /** A Sheets date-and-time number */
    recordedAt: number;
  }
): unknown[] {
  const row: unknown[] = new Array(
    Math.max(...Object.values(columns)) + 1
  ).fill("");
  row[columns.id] = payment.id;
  row[columns.timestamp] = payment.bookingKey;
  row[columns.paidOn] = serialFromDate(payment.paidOn);
  row[columns.kind] = payment.kind;
  row[columns.amount] = payment.amount;
  row[columns.note] = payment.note;
  row[columns.recordedBy] = payment.recordedBy;
  row[columns.recordedAt] = payment.recordedAt;
  return row;
}
