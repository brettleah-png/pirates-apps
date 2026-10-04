import { describe, expect, it } from "vitest";
import {
  bookingsToShow,
  countsByWhen,
  groupByMonth,
  matchesSearch,
  parseWhen,
} from "./booking-list";
import { parseBookings } from "./bookings";
import { RESPONSE_HEADERS, RESPONSE_ROWS } from "./bookings.fixtures";

const bookings = parseBookings([RESPONSE_HEADERS, ...RESPONSE_ROWS]);
// Jane Someone's and Mary Anyone's functions are on 17 October
const TODAY = "2026-10-17";

const names = (list: { name: string }[]) => list.map((b) => b.name);

describe("parseWhen", () => {
  it("defaults to upcoming", () => {
    expect(parseWhen(null)).toBe("upcoming");
    expect(parseWhen("nonsense")).toBe("upcoming");
    expect(parseWhen("past")).toBe("past");
  });
});

describe("bookingsToShow", () => {
  it("shows today's and later bookings, soonest first", () => {
    const shown = bookingsToShow(bookings, {
      when: "upcoming",
      search: "",
      today: TODAY,
    });

    expect(names(shown)).toEqual([
      "Jane Someone",
      "Mary Anyone",
      "Person Sur",
      "Berry Allen",
      "Djou Ma",
      "Hond Kat",
    ]);
  });

  it("shows past bookings, most recent first", () => {
    const shown = bookingsToShow(bookings, {
      when: "past",
      search: "",
      today: TODAY,
    });

    expect(names(shown)).toEqual(["John Doe", "Alex Earlier", "Sam Past"]);
  });

  it("shows all bookings, most recent first", () => {
    const shown = bookingsToShow(bookings, {
      when: "all",
      search: "",
      today: TODAY,
    });

    expect(shown).toHaveLength(bookings.length);
    expect(shown[0].name).toBe("Hond Kat");
    expect(shown.at(-1)?.name).toBe("Sam Past");
  });

  it("shows a booking without a readable date only under all", () => {
    const [undated] = parseBookings([
      RESPONSE_HEADERS,
      [
        "",
        "",
        "",
        46300.5,
        "a@example.com",
        "No Date",
        "Party",
        "",
        "",
        "",
        "",
        "",
      ],
    ]);
    const list = [...bookings, undated];

    expect(
      names(
        bookingsToShow(list, { when: "upcoming", search: "", today: TODAY })
      )
    ).not.toContain("No Date");
    expect(
      names(bookingsToShow(list, { when: "past", search: "", today: TODAY }))
    ).not.toContain("No Date");
    expect(
      names(bookingsToShow(list, { when: "all", search: "", today: TODAY }))
    ).toContain("No Date");
  });

  it("combines the search with the dates", () => {
    const shown = bookingsToShow(bookings, {
      when: "upcoming",
      search: "birthday",
      today: TODAY,
    });

    expect(names(shown)).toEqual([
      "Jane Someone",
      "Mary Anyone",
      "Person Sur",
      "Hond Kat",
    ]);
  });
});

describe("matchesSearch", () => {
  const berry = bookings.find((b) => b.name === "Berry Allen")!;

  it("needs every word, in any field, ignoring case", () => {
    expect(matchesSearch(berry, "berry HALLOWEEN")).toBe(true);
    expect(matchesSearch(berry, "berry birthday")).toBe(false);
  });

  it("finds phone numbers with or without spaces", () => {
    expect(matchesSearch(berry, "0711111115")).toBe(true);
    expect(matchesSearch(berry, "071 111 1115")).toBe(true);
  });

  it("finds the month and weekday of the function", () => {
    expect(matchesSearch(berry, "october saturday")).toBe(true);
  });

  it("matches everything when the search is empty", () => {
    expect(matchesSearch(berry, "  ")).toBe(true);
  });
});

describe("countsByWhen", () => {
  it("counts each tab for the current search", () => {
    expect(countsByWhen(bookings, "", TODAY)).toEqual({
      upcoming: 6,
      past: 3,
      all: 9,
    });
    expect(countsByWhen(bookings, "closed", TODAY)).toEqual({
      upcoming: 0,
      past: 2,
      all: 2,
    });
  });
});

describe("groupByMonth", () => {
  it("groups bookings under month headings, in order", () => {
    const shown = bookingsToShow(bookings, {
      when: "upcoming",
      search: "",
      today: TODAY,
    });

    expect(
      groupByMonth(shown).map((group) => [group.label, group.bookings.length])
    ).toEqual([
      ["October 2026", 4],
      ["November 2026", 1],
      ["December 2026", 1],
    ]);
  });
});
