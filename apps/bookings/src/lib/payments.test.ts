import { describe, expect, it } from "vitest";
import {
  amountOverpaid,
  amountReceived,
  damageDepositAfterPayment,
  damageKeptBack,
  describePayment,
  parsePaymentsTab,
  paymentProgress,
  paymentRow,
  paymentsFor,
  paymentStatusAfterPayment,
} from "./payments";

const HEADERS = [
  "App_Id",
  "App_Timestamp",
  "App_PaidOn",
  "App_Kind",
  "App_Amount",
  "App_Note",
  "App_RecordedBy",
  "App_RecordedAt",
];

const JOHN = 46276.75166995371;
const JANE = 46227.39008162037;

// prettier-ignore
const ROWS: unknown[][] = [
  ["p2", JOHN, 46310, "Payment", 2000, "EFT DOE", "treasurer@example.com", 46310.5],
  ["p1", JOHN, 46300, "Payment", 500, "", "treasurer@example.com", 46300.5],
  ["", "", "", "", "", "", "", ""],
  ["p3", JOHN, 46320, "Damage deposit refund", 500, "", "treasurer@example.com", 46320.5],
  ["p4", JANE, 46301, "nonsense", "not a number", "", "", ""],
];

const tab = parsePaymentsTab([HEADERS, ...ROWS]);

describe("parsePaymentsTab", () => {
  it("reads each payment, skipping rows without an ID", () => {
    expect(tab.payments.map((p) => p.id)).toEqual(["p2", "p1", "p3", "p4"]);
    expect(tab.payments[0]).toEqual({
      id: "p2",
      bookingKey: String(JOHN),
      paidOn: "2026-10-15",
      kind: "Payment",
      amount: 2000,
      note: "EFT DOE",
      recordedBy: "treasurer@example.com",
      row: 2,
    });
  });

  it("reads an unknown kind as a payment, and a bad amount as 0", () => {
    expect(tab.payments[3]).toMatchObject({ kind: "Payment", amount: 0 });
  });

  it("needs every column", () => {
    expect(() => parsePaymentsTab([HEADERS.slice(1)])).toThrow(
      'The "Payments" tab has no "App_Id" column'
    );
  });
});

describe("paymentsFor and amountReceived", () => {
  const johns = paymentsFor(tab.payments, String(JOHN));

  it("finds a booking's payments, oldest first", () => {
    expect(johns.map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("adds up what came in, not the damage deposit paid back", () => {
    expect(amountReceived(johns)).toBe(2500);
  });

  it("takes an overpayment paid back off what came in", () => {
    const overpaidBack = { ...johns[0], kind: "Overpayment refund" as const };
    expect(amountReceived([...johns, overpaidBack])).toBe(2000);
  });
});

describe("amountOverpaid", () => {
  it("is what came in over the invoice, and 0 without an invoice", () => {
    expect(amountOverpaid(4500, 4000)).toBe(500);
    expect(amountOverpaid(3000, 4000)).toBe(0);
    expect(amountOverpaid(500, 0)).toBe(0);
  });
});

describe("paymentStatusAfterPayment", () => {
  it("is Deposit Paid from half the invoice, Full Payment Received from all of it", () => {
    expect(paymentStatusAfterPayment("Invoice Sent", 1999, 4000)).toBe(
      "Invoice Sent"
    );
    expect(paymentStatusAfterPayment("Invoice Sent", 2000, 4000)).toBe(
      "Deposit Paid"
    );
    expect(paymentStatusAfterPayment("Deposit Paid", 4000, 4000)).toBe(
      "Full Payment Received"
    );
    expect(paymentStatusAfterPayment("None", 4500, 4000)).toBe(
      "Full Payment Received"
    );
  });

  it("never moves back", () => {
    expect(paymentStatusAfterPayment("Full Payment Received", 100, 4000)).toBe(
      "Full Payment Received"
    );
  });

  it("leaves Refunded alone, and does nothing without an invoice", () => {
    expect(paymentStatusAfterPayment("Refunded", 4000, 4000)).toBe("Refunded");
    expect(paymentStatusAfterPayment("Invoice Sent", 2000, 0)).toBe(
      "Invoice Sent"
    );
  });
});

describe("paymentProgress", () => {
  it("is waiting for the deposit until half is in", () => {
    expect(paymentProgress(4000, 1500)).toEqual({
      stage: "Waiting for deposit",
      toCome: 2500,
      overpaid: 0,
      percent: 37.5,
    });
  });

  it("has the deposit from half, and is paid in full from all of it", () => {
    expect(paymentProgress(4000, 2000).stage).toBe("Deposit paid");
    expect(paymentProgress(4000, 4000)).toEqual({
      stage: "Paid in full",
      toCome: 0,
      overpaid: 0,
      percent: 100,
    });
  });

  it("caps the bar at the invoice and says what was paid over it", () => {
    expect(paymentProgress(4000, 4500)).toMatchObject({
      toCome: 0,
      overpaid: 500,
      percent: 100,
    });
  });
});

describe("damageDepositAfterPayment", () => {
  it("is Paid once the whole invoice is", () => {
    expect(damageDepositAfterPayment("Outstanding", 3999, 4000)).toBe(
      "Outstanding"
    );
    expect(damageDepositAfterPayment("Outstanding", 4000, 4000)).toBe("Paid");
  });

  it("leaves a settled or unneeded deposit alone", () => {
    expect(damageDepositAfterPayment("Not required", 1500, 1500)).toBe(
      "Not required"
    );
    expect(damageDepositAfterPayment("Refunded", 4000, 4000)).toBe("Refunded");
  });
});

describe("damageKeptBack", () => {
  it("is what wasn't paid back, or empty when nothing was kept", () => {
    expect(damageKeptBack(500, 150)).toBe("350");
    expect(damageKeptBack(500, 500)).toBe("");
    expect(damageKeptBack(0, 200)).toBe("");
  });
});

describe("describePayment", () => {
  it("says what happened, for the history", () => {
    expect(
      describePayment({
        kind: "Payment",
        amount: 2000,
        paidOn: "2026-10-12",
        note: "EFT DOE",
      })
    ).toBe("Payment received: R 2,000.00 on 12 Oct 2026 (EFT DOE).");
    expect(
      describePayment({
        kind: "Damage deposit refund",
        amount: 350,
        paidOn: "2026-10-20",
        note: "",
      })
    ).toBe("Damage deposit paid back: R 350.00 on 20 Oct 2026.");
  });
});

describe("paymentRow", () => {
  it("puts each value in its column, with the date as a Sheets day number", () => {
    const row = paymentRow(tab.columns, {
      id: "p9",
      bookingKey: JOHN,
      paidOn: "2026-10-15",
      kind: "Refund",
      amount: 1000,
      note: "Cancelled",
      recordedBy: "treasurer@example.com",
      recordedAt: 46310.5,
    });
    expect(row).toEqual([
      "p9",
      JOHN,
      46310,
      "Refund",
      1000,
      "Cancelled",
      "treasurer@example.com",
      46310.5,
    ]);
  });
});
