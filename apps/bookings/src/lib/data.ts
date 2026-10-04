// Loads the bookings from the spreadsheet
import { parseBookings, RESPONSES_TAB, type Booking } from "./bookings";
import { readTab } from "./sheets";

export async function loadBookings(): Promise<Booking[]> {
  return parseBookings(await readTab(RESPONSES_TAB));
}
