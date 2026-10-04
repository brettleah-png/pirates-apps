// Everything that changes the spreadsheet. Each action checks the signed-in
// person's permissions on the server: hiding a button is a convenience, this
// is the check.
import {
  ActionError,
  defineAction,
  type ActionAPIContext,
} from "astro:actions";
import { z } from "astro/zod";
import { idNumberCell, RESPONSES_TAB } from "../lib/bookings";
import { loadBookingData, type BookingData } from "../lib/data";
import { sheetsNowInSouthAfrica, todayInSouthAfrica } from "../lib/dates";
import {
  canChangeNote,
  HISTORY_TAB,
  historyRow,
  newEntryId,
  type HistoryEntry,
} from "../lib/history";
import {
  appendRow,
  deleteRow,
  writeCells,
  type CellValue,
} from "../lib/sheets";
import {
  BOOKING_STATUSES,
  canDeleteIdNumber,
  changesToSave,
  DAMAGE_DEPOSIT_STATUSES,
  DEFAULT_TRACKING,
  describeChanges,
  editableFields,
  PAYMENT_STATUSES,
  TRACKING_TAB,
  type EditableField,
  type TrackedBooking,
  type Tracking,
} from "../lib/tracking";
import type { SignedInUser } from "../lib/users";

function signedInUser(context: ActionAPIContext): SignedInUser {
  const { user } = context.locals;
  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Sign in again, then try again.",
    });
  }
  return user;
}

function findBooking(data: BookingData, bookingId: string): TrackedBooking {
  const booking = data.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "That booking isn't in the spreadsheet any more.",
    });
  }
  return booking;
}

function findNote(
  data: BookingData,
  noteId: string,
  user: SignedInUser
): HistoryEntry {
  const note = data.history.entries.find((entry) => entry.id === noteId);
  if (!note) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "That note isn't there any more.",
    });
  }
  if (!canChangeNote(note, user.email, sheetsNowInSouthAfrica())) {
    throw new ActionError({
      code: "FORBIDDEN",
      message:
        "You can only change your own notes, in the first 10 minutes after adding them.",
    });
  }
  return note;
}

// The booking's timestamp as the sheet stores it: a number, so it matches the
// copied Timestamp beside it
function timestampCell(booking: TrackedBooking): unknown {
  const asNumber = Number(booking.timestampKey);
  return Number.isNaN(asNumber) ? booking.timestampKey : asNumber;
}

async function addHistory(
  data: BookingData,
  booking: TrackedBooking,
  user: SignedInUser,
  type: "note" | "change",
  text: string
): Promise<void> {
  await appendRow(
    HISTORY_TAB,
    historyRow(data.history.columns, {
      id: newEntryId(),
      bookingKey: timestampCell(booking),
      at: sheetsNowInSouthAfrica(),
      by: user.email,
      type,
      text,
    })
  );
}

// The values the edit form showed, sent back as JSON
function parseShown(json: string): Tracking {
  try {
    return { ...DEFAULT_TRACKING, ...JSON.parse(json) };
  } catch {
    throw new ActionError({
      code: "BAD_REQUEST",
      message: "The form was out of date. Reload the page and try again.",
    });
  }
}

const NOTE_TEXT = z
  .string()
  .trim()
  .min(1, "Write something first.")
  .max(2000, "Keep notes under 2,000 characters.");

export const server = {
  /** Saves the edit form: only the fields this person may change, and only ones they changed */
  saveTracking: defineAction({
    accept: "form",
    input: z.object({
      bookingId: z.string(),
      // The values the form showed when it was opened, as JSON
      shown: z.string(),
      status: z.enum(BOOKING_STATUSES).optional(),
      paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
      invoiceNumber: z.string().max(100).optional(),
      damageDeposit: z.enum(DAMAGE_DEPOSIT_STATUSES).optional(),
      damageKeptBack: z.string().max(100).optional(),
      damageNote: z.string().max(2000).optional(),
    }),
    handler: async (input, context) => {
      const user = signedInUser(context);
      if (editableFields(user.permissions).length === 0) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "You can't change bookings.",
        });
      }

      const data = await loadBookingData();
      const booking = findBooking(data, input.bookingId);
      const { outOfLineRows, rowByTimestamp, columns } = data.tracking;
      if (outOfLineRows.length > 0) {
        throw new ActionError({
          code: "CONFLICT",
          message: `"Tracking Data" no longer lines up with "Form responses 1" (row ${outOfLineRows.join(", ")}), so saving is paused. Ask an admin to fix the tab.`,
        });
      }
      const row = rowByTimestamp.get(booking.timestampKey);
      if (!row) {
        throw new ActionError({
          code: "CONFLICT",
          message: `This booking has no row in "Tracking Data". Check the tab's copy formula reaches it.`,
        });
      }

      const shown = parseShown(input.shown);
      const changes = changesToSave(shown, input, user.permissions);
      const changedFields = Object.keys(changes) as EditableField[];
      if (changedFields.length === 0) {
        return { changed: false };
      }

      const cells: CellValue[] = [
        { row, column: columns.timestamp, value: timestampCell(booking) },
        ...changedFields.map((field) => ({
          row,
          column: columns[field],
          value: changes[field],
        })),
        { row, column: columns.updatedBy, value: user.email },
        { row, column: columns.updatedAt, value: sheetsNowInSouthAfrica() },
      ];
      await writeCells(TRACKING_TAB, cells);
      await addHistory(
        data,
        booking,
        user,
        "change",
        describeChanges(booking.tracking, changes)
      );
      return { changed: true };
    },
  }),

  addNote: defineAction({
    accept: "form",
    input: z.object({ bookingId: z.string(), text: NOTE_TEXT }),
    handler: async (input, context) => {
      const user = signedInUser(context);
      if (!user.permissions.notesAndStatus) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "You can't add notes.",
        });
      }
      const data = await loadBookingData();
      await addHistory(
        data,
        findBooking(data, input.bookingId),
        user,
        "note",
        input.text
      );
      return { added: true };
    },
  }),

  editNote: defineAction({
    accept: "form",
    input: z.object({ noteId: z.string(), text: NOTE_TEXT }),
    handler: async (input, context) => {
      const user = signedInUser(context);
      const data = await loadBookingData();
      const note = findNote(data, input.noteId, user);
      const { columns } = data.history;
      await writeCells(HISTORY_TAB, [
        { row: note.row, column: columns.text, value: input.text },
        {
          row: note.row,
          column: columns.editedAt,
          value: sheetsNowInSouthAfrica(),
        },
      ]);
      return { edited: true };
    },
  }),

  deleteNote: defineAction({
    accept: "form",
    input: z.object({ noteId: z.string() }),
    handler: async (input, context) => {
      const user = signedInUser(context);
      const data = await loadBookingData();
      const note = findNote(data, input.noteId, user);
      await deleteRow(HISTORY_TAB, note.row);
      return { deleted: true };
    },
  }),

  /** Clears the ID number in "Form responses 1", once the club no longer needs it */
  deleteIdNumber: defineAction({
    accept: "form",
    input: z.object({ bookingId: z.string() }),
    handler: async (input, context) => {
      const user = signedInUser(context);
      if (!user.permissions.editDetails) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "You can't delete ID numbers.",
        });
      }
      const data = await loadBookingData();
      const booking = findBooking(data, input.bookingId);
      if (!canDeleteIdNumber(booking, todayInSouthAfrica())) {
        throw new ActionError({
          code: "FORBIDDEN",
          message:
            "The ID number can be deleted once the function is over and the damage deposit is refunded or not required, or when the booking is cancelled.",
        });
      }
      const cell = idNumberCell(data.responseRows, booking.timestampKey);
      if (!cell) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Couldn't find the ID number cell.",
        });
      }
      await writeCells(RESPONSES_TAB, [{ ...cell, value: "" }]);
      await addHistory(data, booking, user, "change", "ID number deleted.");
      return { deleted: true };
    },
  }),
};
