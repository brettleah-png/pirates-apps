// Loads the bookings, what's tracked for them, their history, invoices and
// payments, in one request to the spreadsheet
import { parseBookings, RESPONSES_TAB } from "./bookings";
import { HISTORY_TAB, parseHistoryTab, type HistoryTab } from "./history";
import { INVOICES_TAB, parseInvoicesTab, type InvoicesTab } from "./invoices";
import { parsePaymentsTab, PAYMENTS_TAB, type PaymentsTab } from "./payments";
import { readTabs } from "./sheets";
import {
  parseTrackingTab,
  TRACKING_TAB,
  withTracking,
  type TrackedBooking,
  type TrackingTab,
} from "./tracking";

export interface BookingData {
  bookings: TrackedBooking[];
  tracking: TrackingTab;
  history: HistoryTab;
  invoices: InvoicesTab;
  payments: PaymentsTab;
  /** "Form responses 1" as read, for finding cells to change */
  responseRows: unknown[][];
}

export async function loadBookingData(): Promise<BookingData> {
  const tabs = await readTabs([
    RESPONSES_TAB,
    TRACKING_TAB,
    HISTORY_TAB,
    INVOICES_TAB,
    PAYMENTS_TAB,
  ]);
  const tracking = parseTrackingTab(tabs[TRACKING_TAB]);
  return {
    bookings: withTracking(parseBookings(tabs[RESPONSES_TAB]), tracking),
    tracking,
    history: parseHistoryTab(tabs[HISTORY_TAB]),
    invoices: parseInvoicesTab(tabs[INVOICES_TAB]),
    payments: parsePaymentsTab(tabs[PAYMENTS_TAB]),
    responseRows: tabs[RESPONSES_TAB],
  };
}
