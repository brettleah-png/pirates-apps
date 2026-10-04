import { describe, expect, it } from "vitest";
import { parseBookings } from "./bookings";
import {
  RESPONSE_HEADERS,
  RESPONSE_ROWS,
  TRACKING_HEADERS,
  TRACKING_ROWS,
} from "./bookings.fixtures";
import {
  canDeleteIdNumber,
  changesToSave,
  clashesWith,
  DEFAULT_TRACKING,
  describeChanges,
  editableFields,
  isConfirmed,
  parseTrackingTab,
  withTracking,
  type TrackedBooking,
} from "./tracking";
import { NO_PERMISSIONS } from "./users";

const tab = parseTrackingTab([TRACKING_HEADERS, ...TRACKING_ROWS]);
const bookings = withTracking(
  parseBookings([RESPONSE_HEADERS, ...RESPONSE_ROWS]),
  tab
);

function byName(name: string): TrackedBooking {
  const booking = bookings.find((b) => b.name === name);
  if (!booking) throw new Error(`No booking for ${name}`);
  return booking;
}

describe("parseTrackingTab", () => {
  it("reads saved values and attaches them to the right booking", () => {
    expect(byName("John Doe").tracking).toEqual({
      status: "Client Contacted",
      paymentStatus: "Deposit Paid",
      invoiceNumber: "INV-TEST-001",
      damageDeposit: "Paid",
      damageKeptBack: "",
      damageNote: "",
      updatedBy: "committee@example.com",
      updatedAt: 46297.5, // 2 October 2026, 12:00
    });
    expect(byName("Sam Past").tracking).toMatchObject({
      damageDeposit: "Refunded",
      damageKeptBack: "350",
      damageNote: "Broken chair",
    });
  });

  it("gives untracked bookings the defaults", () => {
    expect(byName("Jane Someone").tracking).toEqual(DEFAULT_TRACKING);
    expect(DEFAULT_TRACKING).toMatchObject({
      status: "New",
      paymentStatus: "None",
      damageDeposit: "Outstanding",
    });
  });

  it("knows each booking's row, so a save goes in the right place", () => {
    // Mary Anyone's copied row is sheet row 4
    expect(tab.rowByTimestamp.get("46275.77846052083")).toBe(4);
    expect(tab.outOfLineRows).toEqual([]);
  });

  it("spots rows that are out of line, but still shows the right values", () => {
    // A response row was deleted: the copy moved up a row, the App_ values didn't
    const copied = TRACKING_ROWS.map((row) => row.at(-1));
    const shifted = TRACKING_ROWS.map((row, i) => [
      ...row.slice(0, -1),
      copied[i + 1] ?? "",
    ]);

    const shiftedTab = parseTrackingTab([TRACKING_HEADERS, ...shifted]);

    expect(shiftedTab.outOfLineRows).toEqual([2, 4, 6, 9]);
    expect(shiftedTab.byTimestamp.get("46276.75166995371")?.invoiceNumber).toBe(
      "INV-TEST-001"
    );
  });

  it("gives values typed by hand without an App_Timestamp to the row's booking", () => {
    const row = [
      "",
      "Client Contacted",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      46227.39008162037,
    ];

    const handTyped = parseTrackingTab([TRACKING_HEADERS, row]);

    expect(handTyped.byTimestamp.get("46227.39008162037")?.status).toBe(
      "Client Contacted"
    );
    expect(handTyped.outOfLineRows).toEqual([]);
  });

  it("names a missing column", () => {
    const headers = TRACKING_HEADERS.filter((h) => h !== "App_PaymentStatus");

    expect(() => parseTrackingTab([headers])).toThrow(
      'The "Tracking Data" tab has no "App_PaymentStatus" column'
    );
    expect(() => parseTrackingTab([TRACKING_HEADERS.slice(0, -1)])).toThrow(
      'The "Tracking Data" tab has no "Timestamp" column'
    );
  });
});

describe("isConfirmed", () => {
  it("is true once the deposit or full payment is in", () => {
    expect(isConfirmed(byName("John Doe").tracking)).toBe(true);
    expect(isConfirmed(byName("Mary Anyone").tracking)).toBe(true);
  });

  it("is false before payment, or once cancelled", () => {
    expect(isConfirmed(byName("Jane Someone").tracking)).toBe(false);
    expect(isConfirmed(byName("Berry Allen").tracking)).toBe(false);
  });
});

describe("clashesWith", () => {
  it("finds other confirmed bookings on the same date", () => {
    // Jane and Mary are both on 17 October; Mary has paid
    expect(
      clashesWith(byName("Jane Someone"), bookings).map((b) => b.name)
    ).toEqual(["Mary Anyone"]);
  });

  it("doesn't count the booking itself, or unconfirmed ones", () => {
    expect(clashesWith(byName("Mary Anyone"), bookings)).toEqual([]);
  });
});

describe("editableFields", () => {
  it("lets each permission change its own fields", () => {
    expect(editableFields({ ...NO_PERMISSIONS, notesAndStatus: true })).toEqual(
      ["status"]
    );
    expect(editableFields({ ...NO_PERMISSIONS, payments: true })).toEqual([
      "paymentStatus",
      "invoiceNumber",
      "damageDeposit",
      "damageKeptBack",
      "damageNote",
    ]);
    expect(editableFields({ ...NO_PERMISSIONS, viewBookings: true })).toEqual(
      []
    );
  });
});

describe("changesToSave", () => {
  const allPermissions = {
    viewBookings: true,
    editDetails: true,
    notesAndStatus: true,
    payments: true,
  };

  it("saves only the fields that were changed in the form", () => {
    const shown = { ...DEFAULT_TRACKING };
    const submitted = {
      status: "Client Contacted",
      paymentStatus: "None",
      invoiceNumber: " INV-1 ",
      damageDeposit: "Outstanding",
    };

    expect(changesToSave(shown, submitted, allPermissions)).toEqual({
      status: "Client Contacted",
      invoiceNumber: "INV-1",
    });
  });

  it("ignores fields the person may not change", () => {
    const submitted = { status: "Cancelled", paymentStatus: "Refunded" };
    const statusOnly = { ...NO_PERMISSIONS, notesAndStatus: true };

    expect(changesToSave(DEFAULT_TRACKING, submitted, statusOnly)).toEqual({
      status: "Cancelled",
    });
  });
});

describe("describeChanges", () => {
  it("lists each change, from old to new", () => {
    expect(
      describeChanges(DEFAULT_TRACKING, {
        status: "Client Contacted",
        invoiceNumber: "INV-1",
      })
    ).toBe("Status: New → Client Contacted. Invoice number: — → INV-1.");
  });
});

describe("canDeleteIdNumber", () => {
  const TODAY = "2026-12-31";

  it("allows it once the function is over and the deposit is settled", () => {
    // Sam Past: function in August, deposit refunded
    expect(canDeleteIdNumber(byName("Sam Past"), TODAY)).toBe(true);
  });

  it("allows it for a cancelled booking", () => {
    expect(canDeleteIdNumber(byName("Berry Allen"), "2026-10-01")).toBe(true);
  });

  it("refuses while the deposit is outstanding or paid, or before the function", () => {
    // John Doe: deposit paid, not refunded yet
    expect(canDeleteIdNumber(byName("John Doe"), TODAY)).toBe(false);
    const settledButUpcoming = {
      ...byName("Sam Past"),
      date: "2027-01-10",
    };
    expect(canDeleteIdNumber(settledButUpcoming, TODAY)).toBe(false);
  });

  it("has nothing to delete once the ID number is gone", () => {
    expect(
      canDeleteIdNumber({ ...byName("Sam Past"), idNumber: "" }, TODAY)
    ).toBe(false);
  });
});
