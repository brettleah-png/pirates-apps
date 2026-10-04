import { describe, expect, it } from "vitest";
import { canView, NO_PERMISSIONS, permissionsFromUsersTab } from "./users";

const HEADERS = [
  "Email",
  "VIEW_BOOKINGS",
  "EDIT_BOOKING_DETAILS",
  "NOTES_AND_STATUS",
  "PAYMENTS",
];

describe("permissionsFromUsersTab", () => {
  it("reads a listed person's ticked boxes", () => {
    const rows = [HEADERS, ["treasurer@example.com", true, false, true, true]];

    expect(permissionsFromUsersTab(rows, "treasurer@example.com")).toEqual({
      viewBookings: true,
      editDetails: false,
      notesAndStatus: true,
      payments: true,
    });
  });

  it("gives no permissions to someone who isn't listed", () => {
    const rows = [HEADERS, ["treasurer@example.com", true, true, true, true]];

    expect(permissionsFromUsersTab(rows, "stranger@example.com")).toEqual(
      NO_PERMISSIONS
    );
  });

  it("matches emails regardless of case and spaces", () => {
    const rows = [
      HEADERS,
      ["  Treasurer@Example.com ", true, false, false, false],
    ];

    expect(
      permissionsFromUsersTab(rows, "treasurer@example.com").viewBookings
    ).toBe(true);
  });

  it("finds columns in any order, in upper or lower case", () => {
    const rows = [
      [
        " payments ",
        "EMAIL",
        "notes_and_status",
        "View_Bookings",
        "EDIT_BOOKING_DETAILS",
      ],
      [true, "treasurer@example.com", false, false, false],
    ];

    expect(permissionsFromUsersTab(rows, "treasurer@example.com")).toEqual({
      viewBookings: false,
      editDetails: false,
      notesAndStatus: false,
      payments: true,
    });
  });

  it("needs the exact header, not one that only starts the same", () => {
    const rows = [
      [
        "Email",
        "VIEW_BOOKINGS",
        "EDIT_BOOKING_DETAILS",
        "NOTES_AND_STATUS",
        "PAYMENTS_OLD",
      ],
      ["treasurer@example.com", true, true, true, true],
    ];

    expect(() =>
      permissionsFromUsersTab(rows, "treasurer@example.com")
    ).toThrow('The Users tab has no "PAYMENTS" column');
  });

  it("counts a typed Yes or TRUE as granted", () => {
    const rows = [
      HEADERS,
      ["treasurer@example.com", "Yes", " yes ", "TRUE", false],
    ];

    expect(permissionsFromUsersTab(rows, "treasurer@example.com")).toEqual({
      viewBookings: true,
      editDetails: true,
      notesAndStatus: true,
      payments: false,
    });
  });

  it("counts No, blank cells and anything else as not granted", () => {
    const rows = [HEADERS, ["treasurer@example.com", "No", "", undefined, "y"]];

    expect(permissionsFromUsersTab(rows, "treasurer@example.com")).toEqual(
      NO_PERMISSIONS
    );
  });

  it("names the missing column when the header row is incomplete", () => {
    const rows = [
      ["Email", "VIEW_BOOKINGS"],
      ["treasurer@example.com", true],
    ];

    expect(() =>
      permissionsFromUsersTab(rows, "treasurer@example.com")
    ).toThrow('The Users tab has no "EDIT_BOOKING_DETAILS" column');
  });

  it("treats an empty tab as having no email column", () => {
    expect(() => permissionsFromUsersTab([], "treasurer@example.com")).toThrow(
      'The Users tab has no "EMAIL" column'
    );
  });
});

describe("canView", () => {
  it("is false with no permissions", () => {
    expect(canView(NO_PERMISSIONS)).toBe(false);
  });

  it("is true with any one permission, because every permission includes viewing", () => {
    expect(canView({ ...NO_PERMISSIONS, payments: true })).toBe(true);
  });
});
