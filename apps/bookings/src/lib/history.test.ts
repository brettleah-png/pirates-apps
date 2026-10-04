import { describe, expect, it } from "vitest";
import { HISTORY_HEADERS, HISTORY_ROWS } from "./bookings.fixtures";
import {
  canChangeNote,
  historyFor,
  historyRow,
  newEntryId,
  parseHistoryTab,
  type HistoryEntry,
} from "./history";

const tab = parseHistoryTab([HISTORY_HEADERS, ...HISTORY_ROWS]);
const JOHN = "46276.75166995371";

describe("parseHistoryTab", () => {
  it("reads notes and changes, with their row in the tab", () => {
    expect(tab.entries[0]).toEqual({
      id: "n1",
      bookingKey: JOHN,
      at: 46290.5,
      by: "committee@example.com",
      type: "note",
      text: "Called them, they're confirming numbers",
      editedAt: null,
      row: 2,
    });
    expect(tab.entries[1].type).toBe("change");
    expect(tab.entries[2].editedAt).toBe(46297.61);
  });

  it("skips blank rows", () => {
    expect(
      parseHistoryTab([HISTORY_HEADERS, [], ["", "", ""]]).entries
    ).toEqual([]);
  });

  it("names a missing column", () => {
    expect(() => parseHistoryTab([HISTORY_HEADERS.slice(0, 3)])).toThrow(
      'The "History" tab has no "App_By" column'
    );
  });
});

describe("historyFor", () => {
  it("gives one booking's history, newest first", () => {
    expect(historyFor(tab.entries, JOHN).map((entry) => entry.id)).toEqual([
      "n2",
      "c1",
      "n1",
    ]);
  });
});

describe("canChangeNote", () => {
  const note: HistoryEntry = { ...tab.entries[0], at: 46300 };
  const tenMinutes = 10 / (24 * 60);

  it("lets the author change it for 10 minutes", () => {
    expect(
      canChangeNote(note, "committee@example.com", 46300 + tenMinutes)
    ).toBe(true);
    expect(canChangeNote(note, "COMMITTEE@example.com", 46300)).toBe(true);
  });

  it("stops after 10 minutes", () => {
    expect(
      canChangeNote(note, "committee@example.com", 46300 + tenMinutes * 1.1)
    ).toBe(false);
  });

  it("doesn't let anyone else change it, or anyone change a saved change", () => {
    expect(canChangeNote(note, "treasurer@example.com", 46300)).toBe(false);
    expect(
      canChangeNote({ ...note, type: "change" }, "committee@example.com", 46300)
    ).toBe(false);
  });
});

describe("historyRow", () => {
  it("puts a new entry's values in the tab's column order", () => {
    const columns = parseHistoryTab([
      [
        "App_Text",
        "App_Id",
        "App_By",
        "App_Type",
        "App_At",
        "App_EditedAt",
        "App_Timestamp",
      ],
    ]).columns;

    expect(
      historyRow(columns, {
        id: "abc",
        bookingKey: 46276.75166995371,
        at: 46300.5,
        by: "committee@example.com",
        type: "note",
        text: "Hello",
      })
    ).toEqual([
      "Hello",
      "abc",
      "committee@example.com",
      "note",
      46300.5,
      "",
      46276.75166995371,
    ]);
  });
});

describe("newEntryId", () => {
  it("makes short, different IDs", () => {
    expect(newEntryId()).toMatch(/^[0-9a-f]{12}$/);
    expect(newEntryId()).not.toBe(newEntryId());
  });
});
