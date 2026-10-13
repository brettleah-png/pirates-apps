// Made-up rows in the shape the Sheets API returns: raw values, so dates are
// day numbers and times are fractions of a day. Based on the test spreadsheet,
// plus two past bookings. Used by the tests.

const TERMS = "I accept the terms and conditions as stipulated above";

export const RESPONSE_HEADERS = [
  "Timestamp",
  "Email address",
  "Name and Surname",
  "Type of Function",
  "Date of Function",
  "Cell Number (Eg. 0712345678)",
  "ID Number (Eg. 9001012345678)",
  "Do you accept the Terms and Conditions as stipulated above?",
  "End Time\n\nThis is when you will be expected to vacate the property.\nIf the function continues past this time, extra charges may apply.",
  "(optional) Special Considerations ",
  "Are you a registered member of the Helderberg Pirates Baseball club?",
  "Start Time\n\nThis is the time that the club will be made available to you on the day of the function.\nTake any setup required into account.",
];

// "Form responses 1": one row per line, like the spreadsheet
// prettier-ignore
export const RESPONSE_ROWS: unknown[][] = [
  // Older form: date and start time together, End Time is hours
  [46276.75166995371, "example@mail.co.za", "John Doe", "50th birthday", 46311.75, "0711111111", 9901111111111, TERMS, 7, "", "No"],
  [46227.39008162037, "example@mail.co.za", "Jane Someone", "4th Birthday Party", 46312.375, "0711111112", 9901111111111, TERMS, 4, "", "No"],
  [46275.77846052083, "example@mail.co.za", "Mary Anyone", "Birthday party", 46312.54166666667, "0711111113", 9901111111111, TERMS, 4, "", "No"],
  // Newer form: date only, Start Time and End Time are times of day
  [46279.352024618056, "example@mail.co.za", "Person Sur", "Birthday ", 46325, "0711111114", 9901111111111, TERMS, 0.9583333333357587, "", "Yes", 0.8333333333357587],
  [46282.41912167824, "example@mail.co.za", "Berry Allen", "Halloween event for kids and accompanying parents. ", 46326, "0711111115", 9901111111111, TERMS, 0.875, "We ideally need space for 100 people indoors but would appreciate any outdoor space as well to so a scavenger hunt or for kids to run around. ", "No", 0.625],
  [46050.55517096065, "example@mail.co.za", "Djou Ma", "20 year high school reunion ", 46347.6875, "0711111116", 9901111111111, TERMS, 8, "Bar tender & screen with speakers for rugby \nWe will get a food truck for catering ", "No"],
  [46258.35165928241, "example@mail.co.za", "Hond Kat", "Birthday", 46367.66666666667, "0711111117", 9901111111111, TERMS, 6, "", "No"],
  // Two past bookings, one of each form
  [46200.4, "example@mail.co.za", "Sam Past", "Club braai", 46240.75, "0711111118", 9901111111111, TERMS, 5, "", "Yes"],
  [46250.5, "example@mail.co.za", "Alex Earlier", "Kids' practice day", 46280, "0711111119", 9901111111111, TERMS, 0.5833333333333334, "", "No", 0.4166666666666667],
];

// "Tracking Data": the app's columns, then a row-by-row copy of the form
// responses. Only the copied Timestamp matters to the app, so the rest of the
// copy is left out here.
export const TRACKING_HEADERS = [
  "App_Timestamp",
  "App_Status",
  "App_PaymentStatus",
  "App_InvoiceNumber",
  "App_DamageDeposit",
  "App_DamageKeptBack",
  "App_DamageNote",
  "App_DeclineReason",
  "App_UpdatedBy",
  "App_UpdatedAt",
  "Timestamp",
];

// Rows line up with RESPONSE_ROWS
// prettier-ignore
export const TRACKING_ROWS: unknown[][] = [
  // John Doe: confirmed (deposit paid)
  [46276.75166995371, "Client Contacted", "Deposit Paid", "INV-TEST-001", "Paid", "", "", "", "committee@example.com", 46297.5, 46276.75166995371],
  // Jane Someone: not tracked yet
  ["", "", "", "", "", "", "", "", "", "", 46227.39008162037],
  // Mary Anyone: confirmed, on the same date as Jane
  [46275.77846052083, "New", "Full Payment Received", "", "Outstanding", "", "", "", "committee@example.com", 46298.25, 46275.77846052083],
  // Person Sur: not tracked yet
  ["", "", "", "", "", "", "", "", "", "", 46279.352024618056],
  // Berry Allen: paid a deposit, then cancelled
  [46282.41912167824, "Cancelled", "Deposit Paid", "INV-TEST-002", "Not required", "", "", "", "committee@example.com", 46299.75, 46282.41912167824],
  // Djou Ma, Hond Kat: not tracked yet
  ["", "", "", "", "", "", "", "", "", "", 46050.55517096065],
  ["", "", "", "", "", "", "", "", "", "", 46258.35165928241],
  // Sam Past: deposit refunded, with some kept back for damage
  [46200.4, "Client Contacted", "Full Payment Received", "INV-TEST-003", "Refunded", 350, "Broken chair", "", "treasurer@example.com", 46245.5, 46200.4],
  // Alex Earlier: not tracked yet
  ["", "", "", "", "", "", "", "", "", "", 46250.5],
];

// "History": notes and saved changes
export const HISTORY_HEADERS = [
  "App_Id",
  "App_Timestamp",
  "App_At",
  "App_By",
  "App_Type",
  "App_Text",
  "App_EditedAt",
];

// prettier-ignore
export const HISTORY_ROWS: unknown[][] = [
  ["n1", 46276.75166995371, 46290.5, "committee@example.com", "note", "Called them, they're confirming numbers", ""],
  ["c1", 46276.75166995371, 46297.5, "committee@example.com", "change", "Payment status: None → Deposit Paid", ""],
  ["n2", 46276.75166995371, 46297.6, "treasurer@example.com", "note", "Deposit received by EFT", 46297.61],
  ["n3", 46275.77846052083, 46298.25, "committee@example.com", "note", "Paid in full", ""],
];
