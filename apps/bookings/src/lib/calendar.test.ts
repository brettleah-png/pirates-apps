import { describe, expect, it } from "vitest";
import { parseBookings, type Booking } from "./bookings";
import { RESPONSE_HEADERS, RESPONSE_ROWS } from "./bookings.fixtures";
import { bookingEvent, eventTitle } from "./calendar";

const bookings = parseBookings([RESPONSE_HEADERS, ...RESPONSE_ROWS]);

function byName(name: string): Booking & { date: string } {
  const booking = bookings.find((b) => b.name === name);
  if (!booking?.date) throw new Error(`No dated booking for ${name}`);
  return { ...booking, date: booking.date };
}

const URL = "https://bookings.helderbergpirates.co.za/bookings/abc123";
const NOW = new Date("2026-10-14T08:00:00Z");

function lines(ics: string): string[] {
  return ics.split("\r\n");
}

describe("eventTitle", () => {
  it("uses only the first name", () => {
    expect(eventTitle(byName("Person Sur"))).toBe("Booked Function (Person)");
    expect(eventTitle({ ...byName("Person Sur"), name: "" })).toBe(
      "Booked Function"
    );
  });
});

describe("bookingEvent", () => {
  it("converts South African times to UTC", () => {
    // Person Sur: 30 October 2026, 20:00 - 23:00
    const ics = lines(bookingEvent(byName("Person Sur"), URL, NOW));
    expect(ics).toContain("DTSTART:20261030T180000Z");
    expect(ics).toContain("DTEND:20261030T210000Z");
    expect(ics).toContain("SUMMARY:Booked Function (Person)");
    expect(ics).toContain("DTSTAMP:20261014T080000Z");
  });

  it("ends on the next day when the function runs past midnight", () => {
    // John Doe: 16 October 2026, 18:00 - 01:00
    const ics = lines(bookingEvent(byName("John Doe"), URL, NOW));
    expect(ics).toContain("DTSTART:20261016T160000Z");
    expect(ics).toContain("DTEND:20261016T230000Z");
  });

  it("makes a whole-day event when there's no start time", () => {
    const booking = { ...byName("Person Sur"), startTime: null, endTime: null };
    const ics = lines(bookingEvent(booking, URL, NOW));
    expect(ics).toContain("DTSTART;VALUE=DATE:20261030");
    expect(ics).toContain("DTEND;VALUE=DATE:20261031");
  });

  it("keeps contact details out of the calendar", () => {
    const booking = byName("Person Sur");
    const ics = bookingEvent(booking, URL, NOW);
    expect(ics).not.toContain(booking.email);
    expect(ics).not.toContain(booking.phone);
    expect(ics).not.toContain("Sur");
  });

  it("escapes text and keeps lines short", () => {
    const booking = {
      ...byName("Person Sur"),
      functionType:
        "Braai, drinks; and a very long description of everything that will happen",
    };
    const ics = bookingEvent(booking, URL, NOW);
    expect(ics).toContain("Braai\\, drinks\\; and");
    for (const line of lines(ics)) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });
});
