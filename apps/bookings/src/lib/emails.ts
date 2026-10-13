// The emails the committee sends clients from their own email app: the
// invoice, and the reply when the club can't take a booking. The app only
// writes the text. Sending happens in the person's email app.
import type { Booking } from "./bookings";
import { bookingWhen } from "./invoices";

export const EMAIL_SUBJECT = "Pirates Club Rental";

export interface Email {
  to: string;
  subject: string;
  body: string;
}

/** Why the club can't take a booking, as the end of "Unfortunately …" */
export const DECLINE_REASONS = {
  booked: "the club house is already booked at that time",
  match: "there is a match at the club on that day",
} as const;

export type DeclineReason = keyof typeof DECLINE_REASONS | "other";

/** "Good day John," using only the first name */
function greeting(booking: Booking): string {
  const firstName = booking.name.split(" ")[0];
  return firstName ? `Good day ${firstName},` : "Good day,";
}

export function invoiceEmail(booking: Booking): Email {
  return {
    to: booking.email,
    subject: EMAIL_SUBJECT,
    body: [
      greeting(booking),
      "",
      `Please find attached the invoice for the rental request on ${bookingWhen(booking)}.`,
      "Feel free to reach out if you have any questions, otherwise our bar manager will be in touch to finalize your booking details for the day of.",
      "",
      "Kind Regards",
    ].join("\n"),
  };
}

/** The reply when the club can't take a booking. The reason finishes "Unfortunately …". */
export function declineEmail(booking: Booking, reason: string): Email {
  return {
    to: booking.email,
    subject: EMAIL_SUBJECT,
    body: [
      greeting(booking),
      "",
      `Thank you for your rental request for ${bookingWhen(booking)}. Unfortunately ${reason}, so we're unable to accept your booking.`,
      "",
      "Kind Regards",
    ].join("\n"),
  };
}

/**
 * A link that opens a new email in the person's email app, filled in. Email
 * links can't carry attachments, so the invoice has to be attached by hand.
 */
export function mailtoLink(email: Email): string {
  // Line breaks in an email link are written as CRLF
  const body = email.body.replace(/\n/g, "\r\n");
  const query = `subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(body)}`;
  // Encoded so an address can't add its own ?subject=, but with a readable @,
  // which some email apps expect
  const to = encodeURIComponent(email.to).replace("%40", "@");
  return `mailto:${to}?${query}`;
}
