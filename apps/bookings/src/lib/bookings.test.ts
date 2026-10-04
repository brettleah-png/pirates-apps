import { describe, expect, it } from "vitest";
import {
  durationInMinutes,
  durationLabel,
  formatPhone,
  idNumberCell,
  parseBookings,
  timeRange,
  type Booking,
} from "./bookings";
import { RESPONSE_HEADERS, RESPONSE_ROWS } from "./bookings.fixtures";

const bookings = parseBookings([RESPONSE_HEADERS, ...RESPONSE_ROWS]);

function byName(name: string): Booking {
  const booking = bookings.find((b) => b.name === name);
  if (!booking) throw new Error(`No booking for ${name}`);
  return booking;
}

describe("parseBookings", () => {
  it("reads every row", () => {
    expect(bookings).toHaveLength(RESPONSE_ROWS.length);
  });

  it("reads an older-form row: start time in the date, End Time in hours", () => {
    const booking = byName("John Doe");

    expect(booking).toMatchObject({
      date: "2026-10-16",
      startTime: "18:00",
      endTime: "01:00",
      endsNextDay: true,
    });
    expect(durationInMinutes(booking)).toBe(7 * 60);
  });

  it("reads a newer-form row: separate start and end times", () => {
    expect(byName("Berry Allen")).toMatchObject({
      date: "2026-10-31",
      startTime: "15:00",
      endTime: "21:00",
      endsNextDay: false,
    });
    expect(durationInMinutes(byName("Berry Allen"))).toBe(6 * 60);
  });

  it("reads the contact details and answers", () => {
    expect(byName("John Doe")).toMatchObject({
      email: "example@mail.co.za",
      phone: "0711111111",
      idNumber: "9901111111111",
      functionType: "50th birthday",
      isMember: false,
      acceptedTerms: true,
      submittedDate: "2026-09-11",
      submittedTime: "18:02",
    });
    expect(byName("Person Sur")).toMatchObject({
      functionType: "Birthday",
      isMember: true,
    });
  });

  it("keeps line breaks in special considerations, without the trailing space", () => {
    expect(byName("Djou Ma").specialConsiderations).toBe(
      "Bar tender & screen with speakers for rugby \nWe will get a food truck for catering"
    );
  });

  it("gives each booking a short ID that doesn't change and doesn't reveal the email", () => {
    const ids = bookings.map((b) => b.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toMatch(/^[0-9a-f]{12}$/);
    expect(parseBookings([RESPONSE_HEADERS, ...RESPONSE_ROWS])[0].id).toBe(
      ids[0]
    );
  });

  it("puts back the leading 0 that numbers lose", () => {
    const row = [...RESPONSE_ROWS[0]];
    row[5] = 711111111; // phone typed as a number
    row[6] = 501011234567; // ID number of someone born in 2005

    const [booking] = parseBookings([RESPONSE_HEADERS, row]);

    expect(booking.phone).toBe("0711111111");
    expect(booking.idNumber).toBe("0501011234567");
  });

  it("reads dates and times typed as text", () => {
    const row = [...RESPONSE_ROWS[4]];
    row[4] = "31/10/2026";
    row[8] = "21:00";
    row[11] = "15:00";

    const [booking] = parseBookings([RESPONSE_HEADERS, row]);

    expect(booking).toMatchObject({
      date: "2026-10-31",
      startTime: "15:00",
      endTime: "21:00",
    });
  });

  it("leaves times empty when the form answer is missing", () => {
    const row = [...RESPONSE_ROWS[0]];
    row[4] = 46311; // a date with no time
    row[8] = "";

    const [booking] = parseBookings([RESPONSE_HEADERS, row]);

    expect(booking).toMatchObject({
      date: "2026-10-16",
      startTime: null,
      endTime: null,
    });
    expect(durationInMinutes(booking)).toBeNull();
  });

  it("copes with a tab that has no Start Time column yet", () => {
    const headers = RESPONSE_HEADERS.slice(0, 11);
    const row = RESPONSE_ROWS[0].slice(0, 11);

    const [booking] = parseBookings([headers, row]);

    expect(booking).toMatchObject({ startTime: "18:00", endTime: "01:00" });
  });

  it("skips blank rows", () => {
    expect(parseBookings([RESPONSE_HEADERS, [], ["", "", "", ""]])).toEqual([]);
  });

  it("names a missing column it can't do without", () => {
    const headers = RESPONSE_HEADERS.map((h) =>
      h === "Timestamp" ? "When" : h
    );

    expect(() => parseBookings([headers])).toThrow(
      'The "Form responses 1" tab has no "timestamp" column'
    );
  });
});

describe("formatPhone", () => {
  it("spaces a South African mobile number", () => {
    expect(formatPhone("0711111111")).toBe("071 111 1111");
    expect(formatPhone("071 111 1111")).toBe("071 111 1111");
  });

  it("leaves other numbers as typed", () => {
    expect(formatPhone("+27 71 111 1111")).toBe("+27 71 111 1111");
  });
});

describe("timeRange", () => {
  it("shows start and end, or just the start", () => {
    expect(timeRange(byName("John Doe"))).toBe("18:00 – 01:00");
    expect(timeRange({ ...byName("John Doe"), endTime: null })).toBe(
      "From 18:00"
    );
    expect(timeRange({ ...byName("John Doe"), startTime: null })).toBeNull();
  });
});

describe("durationLabel", () => {
  it("writes hours and minutes", () => {
    expect(durationLabel(420)).toBe("7 hours");
    expect(durationLabel(60)).toBe("1 hour");
    expect(durationLabel(270)).toBe("4 h 30 min");
    expect(durationLabel(45)).toBe("45 min");
  });
});

describe("timestampKey", () => {
  it("is the raw Timestamp cell as text, matching what the app saves in App_Timestamp", () => {
    expect(byName("John Doe").timestampKey).toBe("46276.75166995371");
  });
});

describe("idNumberCell", () => {
  it("finds the booking's ID number cell", () => {
    const rows = [RESPONSE_HEADERS, ...RESPONSE_ROWS];

    // Mary Anyone is the third booking (sheet row 4); ID numbers are column G
    expect(idNumberCell(rows, "46275.77846052083")).toEqual({
      row: 4,
      column: 6,
    });
  });

  it("gives null for a booking that isn't there", () => {
    expect(
      idNumberCell([RESPONSE_HEADERS, ...RESPONSE_ROWS], "12345")
    ).toBeNull();
  });
});
