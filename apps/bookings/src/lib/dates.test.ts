import { describe, expect, it } from "vitest";
import {
  dateFromSerial,
  daysFromToday,
  relativeDay,
  sheetsNowInSouthAfrica,
  shortDateTime,
  longDate,
  parseDate,
  parseTime,
  timeFromMinutes,
  timeFromSerial,
  timeInDate,
  todayInSouthAfrica,
} from "./dates";

describe("Sheets numbers", () => {
  it("turns a day number into a date", () => {
    expect(dateFromSerial(46311)).toBe("2026-10-16");
    expect(dateFromSerial(46311.75)).toBe("2026-10-16");
  });

  it("turns a fraction of a day into a time, to the nearest minute", () => {
    expect(timeFromSerial(0.75)).toBe("18:00");
    expect(timeFromSerial(0.9583333333357587)).toBe("23:00");
    // 18:02:24 rounds down to 18:02
    expect(timeFromSerial(46276.75166995371)).toBe("18:02");
  });
});

describe("timeFromMinutes", () => {
  it("wraps past midnight", () => {
    expect(timeFromMinutes(18 * 60 + 7 * 60)).toBe("01:00");
    expect(timeFromMinutes(0)).toBe("00:00");
  });
});

describe("parseDate", () => {
  it("reads day numbers and South African dd/mm/yyyy text", () => {
    expect(parseDate(46326)).toBe("2026-10-31");
    expect(parseDate("31/10/2026")).toBe("2026-10-31");
    expect(parseDate("1/2/2027 18:00")).toBe("2027-02-01");
  });

  it("gives null for blank or unreadable values", () => {
    expect(parseDate("")).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate("next Saturday")).toBeNull();
  });
});

describe("parseTime", () => {
  it("reads fractions of a day and typed times", () => {
    expect(parseTime(0.625)).toBe("15:00");
    expect(parseTime("15:00")).toBe("15:00");
    expect(parseTime("9:30:00")).toBe("09:30");
  });

  it("gives null for blank or unreadable values", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime("afternoon")).toBeNull();
  });
});

describe("timeInDate", () => {
  it("finds the time in a date-and-time cell", () => {
    expect(timeInDate(46311.75)).toBe("18:00");
    expect(timeInDate("16/10/2026 18:00:00")).toBe("18:00");
  });

  it("finds no time in a date-only cell", () => {
    expect(timeInDate(46326)).toBeNull();
    expect(timeInDate("31/10/2026")).toBeNull();
    expect(timeInDate("")).toBeNull();
  });
});

describe("todayInSouthAfrica", () => {
  it("uses South African time, which is 2 hours ahead of UTC", () => {
    expect(todayInSouthAfrica(new Date("2026-10-04T21:59:00Z"))).toBe(
      "2026-10-04"
    );
    expect(todayInSouthAfrica(new Date("2026-10-04T22:00:00Z"))).toBe(
      "2026-10-05"
    );
  });
});

describe("longDate", () => {
  it("writes the weekday, day, month and year", () => {
    expect(longDate("2026-10-31")).toBe("Saturday 31 October 2026");
  });
});

describe("relativeDay", () => {
  it("describes the date compared with today", () => {
    expect(relativeDay("2026-10-04", "2026-10-04")).toBe("Today");
    expect(relativeDay("2026-10-05", "2026-10-04")).toBe("Tomorrow");
    expect(relativeDay("2026-10-31", "2026-10-04")).toBe("In 27 days");
    expect(relativeDay("2026-10-03", "2026-10-04")).toBe("Yesterday");
    expect(relativeDay("2026-09-30", "2026-10-04")).toBe("4 days ago");
  });

  it("counts across months and years", () => {
    expect(daysFromToday("2027-01-01", "2026-12-31")).toBe(1);
  });
});

describe("sheetsNowInSouthAfrica", () => {
  it("gives South African time as a Sheets number", () => {
    // 10:00 UTC is 12:00 in South Africa
    const serial = sheetsNowInSouthAfrica(new Date("2026-10-04T10:00:00Z"));

    expect(dateFromSerial(serial)).toBe("2026-10-04");
    expect(timeFromSerial(serial)).toBe("12:00");
  });
});

describe("shortDateTime", () => {
  it("writes the date and time", () => {
    expect(shortDateTime(46299.75)).toBe("4 Oct 2026, 18:00");
  });
});
