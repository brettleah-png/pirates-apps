// The treasurer's to-do list: what still needs doing with invoices, payments
// and damage deposits. Cancelled and declined bookings are left out.
import { currentInvoice, invoiceTotal, type Invoice } from "./invoices";
import { amountReceived, paymentsFor, type Payment } from "./payments";
import { isCalledOff, type TrackedBooking } from "./tracking";

export interface TodoItem {
  booking: TrackedBooking;
  /** The booking's current invoice, if it has one */
  invoice: Invoice | undefined;
  /** The invoice's total in rand, or 0 without one */
  total: number;
  /** Rand received so far */
  received: number;
  /** Rand still to come for this step: the deposit, or the rest */
  owing: number;
}

export interface PaymentsTodo {
  /** Coming up, with no invoice yet */
  needsInvoice: TodoItem[];
  /** The invoice is made but hasn't been sent */
  notSent: TodoItem[];
  /** Sent, and half the invoice hasn't come in yet */
  awaitingDeposit: TodoItem[];
  /** The deposit is in, the rest isn't */
  balanceOwing: TodoItem[];
  /** The function is over and the damage deposit is still held */
  depositToRefund: TodoItem[];
}

// Soonest function first, so the most overdue and the most urgent are on
// top. Bookings without a date go last.
function bySoonest(a: TodoItem, b: TodoItem): number {
  return (a.booking.date ?? "9999-99-99").localeCompare(
    b.booking.date ?? "9999-99-99"
  );
}

export function paymentsTodo(
  bookings: TrackedBooking[],
  invoices: Invoice[],
  payments: Payment[],
  today: string
): PaymentsTodo {
  const todo: PaymentsTodo = {
    needsInvoice: [],
    notSent: [],
    awaitingDeposit: [],
    balanceOwing: [],
    depositToRefund: [],
  };

  for (const booking of bookings) {
    const { tracking } = booking;
    if (isCalledOff(tracking)) {
      continue;
    }
    const invoice = currentInvoice(invoices, booking.timestampKey);
    const total = invoice ? invoiceTotal(invoice.lines) : 0;
    const received = amountReceived(
      paymentsFor(payments, booking.timestampKey)
    );
    const item = { booking, invoice, total, received, owing: 0 };
    const isOver = booking.date !== null && booking.date < today;

    // Each booking is at one step of getting paid. Past bookings without an
    // invoice are left out: they're from before the app made invoices.
    // So is one with an invoice number typed in by hand.
    if (!invoice) {
      const isPaid = tracking.paymentStatus === "Full Payment Received";
      if (!isOver && !tracking.invoiceNumber && !isPaid) {
        todo.needsInvoice.push(item);
      }
    } else if (invoice.status === "Draft") {
      todo.notSent.push(item);
    } else if (tracking.paymentStatus === "Invoice Sent") {
      todo.awaitingDeposit.push({
        ...item,
        owing: Math.max(0, total / 2 - received),
      });
    } else if (tracking.paymentStatus === "Deposit Paid") {
      todo.balanceOwing.push({ ...item, owing: Math.max(0, total - received) });
    }

    if (isOver && tracking.damageDeposit === "Paid") {
      todo.depositToRefund.push(item);
    }
  }

  for (const items of Object.values(todo)) {
    items.sort(bySoonest);
  }
  return todo;
}

/** Rand still to come across a section */
export function totalOwing(items: TodoItem[]): number {
  return items.reduce((total, item) => total + item.owing, 0);
}
