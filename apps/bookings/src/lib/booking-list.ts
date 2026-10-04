// Searching, filtering, sorting and grouping the bookings list
import { formatPhone, type Booking } from "./bookings";
import { longDate, monthAndYear } from "./dates";

/** Which bookings to show, by date. Upcoming includes today. */
export type When = "upcoming" | "past" | "all";

export const WHEN_LABELS: Record<When, string> = {
  upcoming: "Upcoming",
  past: "Past",
  all: "All",
};

/** The "when" from the address bar, defaulting to upcoming */
export function parseWhen(value: string | null | undefined): When {
  return value === "past" || value === "all" ? value : "upcoming";
}

function isWhen(booking: Booking, when: When, today: string): boolean {
  if (when === "all") {
    return true;
  }
  // A booking without a readable date only shows under "All"
  if (!booking.date) {
    return false;
  }
  return when === "upcoming" ? booking.date >= today : booking.date < today;
}

// Everything a search can match, in lower case
function searchableText(booking: Booking): string {
  return [
    booking.name,
    booking.email,
    booking.phone,
    formatPhone(booking.phone),
    booking.functionType,
    booking.specialConsiderations,
    booking.state,
    booking.invoiceNumber,
    booking.date ? longDate(booking.date) : "",
  ]
    .join(" ")
    .toLowerCase();
}

/** Every word in the search has to appear somewhere in the booking */
export function matchesSearch(booking: Booking, search: string): boolean {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = searchableText(booking);
  return words.every((word) => haystack.includes(word));
}

// Earliest first; bookings without a date or time go last
function compareStart(a: Booking, b: Booking): number {
  const aStart = `${a.date ?? "9999-99-99"} ${a.startTime ?? "99:99"}`;
  const bStart = `${b.date ?? "9999-99-99"} ${b.startTime ?? "99:99"}`;
  return aStart.localeCompare(bStart);
}

/**
 * The bookings to show. Upcoming bookings are soonest first; past and all are
 * most recent first.
 */
export function bookingsToShow(
  bookings: Booking[],
  { when, search, today }: { when: When; search: string; today: string }
): Booking[] {
  const shown = bookings.filter(
    (booking) => isWhen(booking, when, today) && matchesSearch(booking, search)
  );
  shown.sort(compareStart);
  if (when !== "upcoming") {
    shown.reverse();
  }
  return shown;
}

/** How many bookings each "when" would show for this search */
export function countsByWhen(
  bookings: Booking[],
  search: string,
  today: string
): Record<When, number> {
  const matching = bookings.filter((booking) => matchesSearch(booking, search));
  return {
    upcoming: matching.filter((booking) => isWhen(booking, "upcoming", today))
      .length,
    past: matching.filter((booking) => isWhen(booking, "past", today)).length,
    all: matching.length,
  };
}

export interface MonthGroup {
  /** "October 2026", or "No date" */
  label: string;
  bookings: Booking[];
}

/** Bookings grouped under month headings, keeping their order */
export function groupByMonth(bookings: Booking[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const booking of bookings) {
    const label = booking.date ? monthAndYear(booking.date) : "No date";
    const lastGroup = groups.at(-1);
    if (lastGroup?.label === label) {
      lastGroup.bookings.push(booking);
    } else {
      groups.push({ label, bookings: [booking] });
    }
  }
  return groups;
}
