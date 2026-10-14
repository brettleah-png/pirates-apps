// A booking as a calendar event: an .ics file, which the device opens in its
// default calendar app.
//
// The event goes into someone's own calendar, which may sync anywhere, so it
// holds only the client's first name and a link back to the booking. The
// contact details stay in the app.
import { firstName, type Booking } from "./bookings";

const LOCATION =
  "Helderberg Pirates Baseball Club, Lourensford Road, Somerset West";

// South Africa is 2 hours ahead of UTC all year, with no daylight saving
const SOUTH_AFRICA_OFFSET_HOURS = 2;

/** "Booked Function (John)" */
export function eventTitle(booking: Booking): string {
  const name = firstName(booking);
  return name ? `Booked Function (${name})` : "Booked Function";
}

/** "20261030T160000Z": South African "2026-10-30" and "18:00", in UTC */
function utcDateTime(date: string, time: string, addDays = 0): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const utc = new Date(
    Date.UTC(
      year,
      month - 1,
      day + addDays,
      hours - SOUTH_AFRICA_OFFSET_HOURS,
      minutes
    )
  );
  return `${utc.toISOString().slice(0, 19).replace(/[-:]/g, "")}Z`;
}

/** "20261030" for a whole-day event */
function dayOnly(date: string, addDays = 0): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + addDays))
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
}

/** Text in an .ics file escapes backslashes, commas, semicolons and line breaks */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/[,;]/g, (char) => `\\${char}`)
    .replace(/\r?\n/g, "\\n");
}

/** .ics lines longer than 75 characters continue on the next line, after a space */
function fold(line: string): string {
  const parts: string[] = [];
  for (let start = 0; start < line.length; start += 74) {
    parts.push(line.slice(start, start + 74));
  }
  return parts.join("\r\n ");
}

/** When the event runs. Without a start time, it's a whole-day event. */
function eventTimes(booking: Booking & { date: string }): string[] {
  if (!booking.startTime) {
    return [
      `DTSTART;VALUE=DATE:${dayOnly(booking.date)}`,
      `DTEND;VALUE=DATE:${dayOnly(booking.date, 1)}`,
    ];
  }
  const times = [`DTSTART:${utcDateTime(booking.date, booking.startTime)}`];
  if (booking.endTime) {
    const endDay = booking.endsNextDay ? 1 : 0;
    times.push(`DTEND:${utcDateTime(booking.date, booking.endTime, endDay)}`);
  }
  return times;
}

/**
 * The booking as an .ics file. Its UID comes from the booking, so adding it
 * a second time can update the same event instead of making a copy.
 */
export function bookingEvent(
  booking: Booking & { date: string },
  bookingUrl: string,
  now: Date = new Date()
): string {
  const description = [booking.functionType, bookingUrl]
    .filter(Boolean)
    .join("\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Helderberg Pirates//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@bookings.helderbergpirates.co.za`,
    `DTSTAMP:${now.toISOString().slice(0, 19).replace(/[-:]/g, "")}Z`,
    ...eventTimes(booking),
    `SUMMARY:${escapeText(eventTitle(booking))}`,
    `LOCATION:${escapeText(LOCATION)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${bookingUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
