// A booking as a calendar event. Opening it adds the event in the device's
// default calendar app.
import type { APIRoute } from "astro";
import { bookingEvent } from "../../../lib/calendar";
import { loadBookingData } from "../../../lib/data";

export const GET: APIRoute = async ({ params, url }) => {
  const data = await loadBookingData();
  const booking = data.bookings.find((b) => b.id === params.id);
  if (!booking?.date) {
    return new Response("That booking has no date to add.", { status: 404 });
  }

  const bookingUrl = new URL(`/bookings/${booking.id}`, url.origin).href;
  return new Response(
    bookingEvent({ ...booking, date: booking.date }, bookingUrl),
    {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        // Inline, so iPhones offer "Add to Calendar" instead of saving a file
        "Content-Disposition": 'inline; filename="booked-function.ics"',
        "Cache-Control": "private, no-store",
      },
    }
  );
};
