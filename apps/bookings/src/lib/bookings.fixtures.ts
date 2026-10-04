// Made-up rows in the shape the Sheets API returns for "Form responses 1":
// raw values, so dates are day numbers and times are fractions of a day.
// Copied from the test spreadsheet, plus two past bookings. Used by the tests.

export const RESPONSE_HEADERS = [
  "State",
  "Damage Deposit Paid/Refunded",
  "Invoice Number",
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

const TERMS = "I accept the terms and conditions as stipulated above";

// One row per line, like the spreadsheet
// prettier-ignore
export const RESPONSE_ROWS: unknown[][] = [
  // Older form: date and start time together, End Time is hours
  ["Invoice Sent", "Owed", "INV-20260912-003", 46276.75166995371, "example@mail.co.za", "John Doe", "50th birthday", 46311.75, "0711111111", 9901111111111, TERMS, 7, "", "No"],
  ["In Season? Email Sent", "", "", 46227.39008162037, "example@mail.co.za", "Jane Someone", "4th Birthday Party", 46312.375, "0711111112", 9901111111111, TERMS, 4, "", "No"],
  ["In Season? Email Sent", "", "", 46275.77846052083, "example@mail.co.za", "Mary Anyone", "Birthday party", 46312.54166666667, "0711111113", 9901111111111, TERMS, 4, "", "No"],
  // Newer form: date only, Start Time and End Time are times of day
  ["Invoice Sent", "", "", 46279.352024618056, "example@mail.co.za", "Person Sur", "Birthday ", 46325, "0711111114", 9901111111111, TERMS, 0.9583333333357587, "", "Yes", 0.8333333333357587],
  ["Contacted - Pax too many", "", "", 46282.41912167824, "example@mail.co.za", "Berry Allen", "Halloween event for kids and accompanying parents. ", 46326, "0711111115", 9901111111111, TERMS, 0.875, "We ideally need space for 100 people indoors but would appreciate any outdoor space as well to so a scavenger hunt or for kids to run around. ", "No", 0.625],
  ["Invoice Sent", "Owed", "INV-20260201-02", 46050.55517096065, "example@mail.co.za", "Djou Ma", "20 year high school reunion ", 46347.6875, "0711111116", 9901111111111, TERMS, 8, "Bar tender & screen with speakers for rugby \nWe will get a food truck for catering ", "No"],
  ["Invoice Sent", "Owed", "INV-20260912-004", 46258.35165928241, "example@mail.co.za", "Hond Kat", "Birthday", 46367.66666666667, "0711111117", 9901111111111, TERMS, 6, "", "No"],
  // Two past bookings, one of each form
  ["Closed", "Refunded", "INV-20260801-01", 46200.4, "example@mail.co.za", "Sam Past", "Club braai", 46240.75, "0711111118", 9901111111111, TERMS, 5, "", "Yes"],
  ["Closed", "", "", 46250.5, "example@mail.co.za", "Alex Earlier", "Kids' practice day", 46280, "0711111119", 9901111111111, TERMS, 0.5833333333333334, "", "No", 0.4166666666666667],
];
