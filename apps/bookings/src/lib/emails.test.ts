import { describe, expect, it } from "vitest";
import { parseBookings, type Booking } from "./bookings";
import { RESPONSE_HEADERS, RESPONSE_ROWS } from "./bookings.fixtures";
import {
  DECLINE_REASONS,
  declineEmail,
  invoiceEmail,
  mailtoLink,
} from "./emails";

const bookings = parseBookings([RESPONSE_HEADERS, ...RESPONSE_ROWS]);

function byName(name: string): Booking {
  const booking = bookings.find((b) => b.name === name);
  if (!booking) throw new Error(`No booking for ${name}`);
  return booking;
}

describe("invoiceEmail", () => {
  it("greets them and says when the rental is", () => {
    const email = invoiceEmail(byName("Person Sur"));
    expect(email.to).toBe("example@mail.co.za");
    expect(email.subject).toBe("Pirates Club Rental");
    expect(email.body).toBe(
      [
        "Good day Person,",
        "",
        "Please find attached the invoice for the rental request on 30 October 2026, 20:00 - 23:00.",
        "Feel free to reach out if you have any questions, otherwise our bar manager will be in touch to finalize your booking details for the day of.",
        "",
        "Kind Regards",
      ].join("\n")
    );
  });
});

describe("greeting", () => {
  it("uses only the first name, or none when there's no name", () => {
    const booking = byName("Person Sur");
    expect(
      invoiceEmail({ ...booking, name: "Mary-Jane van der Merwe" }).body
    ).toMatch(/^Good day Mary-Jane,\n/);
    expect(invoiceEmail({ ...booking, name: "" }).body).toMatch(/^Good day,\n/);
  });
});

describe("declineEmail", () => {
  it("gives the reason", () => {
    const email = declineEmail(byName("Person Sur"), DECLINE_REASONS.match);
    expect(email.body).toContain(
      "Thank you for your rental request for 30 October 2026, 20:00 - 23:00. Unfortunately there is a match at the club on that day, so we're unable to accept your booking."
    );
  });
});

describe("mailtoLink", () => {
  it("fills in the address, subject and message", () => {
    const link = mailtoLink({
      to: "someone@example.com",
      subject: "Pirates Club Rental",
      body: "Line one\nLine two & more",
    });
    expect(link).toBe(
      "mailto:someone@example.com?subject=Pirates%20Club%20Rental&body=Line%20one%0D%0ALine%20two%20%26%20more"
    );
  });

  it("can't be given extra fields through the address", () => {
    const link = mailtoLink({
      to: "a@b.com?bcc=evil@example.com",
      subject: "",
      body: "",
    });
    expect(link.startsWith("mailto:a@b.com%3Fbcc%3Devil%40example.com?")).toBe(
      true
    );
  });
});
