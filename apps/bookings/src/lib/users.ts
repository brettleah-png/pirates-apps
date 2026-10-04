// Who can use the app, read from the spreadsheet's Users tab.
//
// The tab has a header row, then one row per person, with a checkbox per
// permission. The permission headers are in capitals to show they're fixed
// names the app looks for, not labels to reword:
//
// | Email | VIEW_BOOKINGS | EDIT_BOOKING_DETAILS | NOTES_AND_STATUS | PAYMENTS |

export type Permission =
  "viewBookings" | "editDetails" | "notesAndStatus" | "payments";

export type Permissions = Record<Permission, boolean>;

export interface SignedInUser {
  email: string;
  name: string;
  permissions: Permissions;
  /** When the permissions were last read from the Users tab (milliseconds since 1970) */
  permissionsCheckedAt: number;
}

/** How each permission is named on screen */
export const PERMISSION_LABELS: Record<Permission, string> = {
  viewBookings: "View bookings",
  editDetails: "Edit booking details",
  notesAndStatus: "Notes and status",
  payments: "Payments",
};

export const NO_PERMISSIONS: Permissions = {
  viewBookings: false,
  editDetails: false,
  notesAndStatus: false,
  payments: false,
};

// The exact headers the app looks for. Columns can be in any order, and
// upper or lower case doesn't matter.
const EMAIL_HEADER = "EMAIL";
const PERMISSION_HEADERS: Record<Permission, string> = {
  viewBookings: "VIEW_BOOKINGS",
  editDetails: "EDIT_BOOKING_DETAILS",
  notesAndStatus: "NOTES_AND_STATUS",
  payments: "PAYMENTS",
};

/** Every permission includes viewing the bookings */
export function canView(permissions: Permissions): boolean {
  return Object.values(permissions).some(Boolean);
}

function normalise(text: unknown): string {
  return String(text ?? "")
    .trim()
    .toLowerCase();
}

function headerName(text: unknown): string {
  return String(text ?? "")
    .trim()
    .toUpperCase();
}

function columnIndex(headers: string[], title: string): number {
  const index = headers.indexOf(title);
  if (index === -1) {
    throw new Error(`The Users tab has no "${title}" column`);
  }
  return index;
}

// A permission is granted by a ticked checkbox, which the Sheets API returns
// as true, or by typing "Yes" or "TRUE". Anything else, including "No" and a
// blank cell, means no.
const GRANTED_TEXT = ["yes", "true"];

function isTicked(value: unknown): boolean {
  return value === true || GRANTED_TEXT.includes(normalise(value));
}

/**
 * Finds a person's permissions in the Users tab's rows (header row first).
 * Someone who isn't listed gets no permissions.
 */
export function permissionsFromUsersTab(
  rows: unknown[][],
  email: string
): Permissions {
  const [headerRow = [], ...people] = rows;
  const headers = headerRow.map(headerName);
  const emailColumn = columnIndex(headers, EMAIL_HEADER);
  const permissionHeaders = Object.entries(PERMISSION_HEADERS) as [
    Permission,
    string,
  ][];
  const permissionColumns = permissionHeaders.map(
    ([permission, title]) => [permission, columnIndex(headers, title)] as const
  );

  const row = people.find(
    (person) => normalise(person[emailColumn]) === normalise(email)
  );
  if (!row) {
    return NO_PERMISSIONS;
  }

  const permissions = { ...NO_PERMISSIONS };
  for (const [permission, column] of permissionColumns) {
    permissions[permission] = isTicked(row[column]);
  }
  return permissions;
}
