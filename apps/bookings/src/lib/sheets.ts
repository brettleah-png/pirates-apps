// Reads the bookings spreadsheet as the app's service account
import { auth, sheets, type sheets_v4 } from "@googleapis/sheets";
import {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SPREADSHEET_ID,
} from "astro:env/server";

// Made once and reused, so the service account's access token is too
let client: sheets_v4.Sheets | undefined;

function sheetsClient(): sheets_v4.Sheets {
  if (!client) {
    const serviceAccount = new auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Netlify keeps the key's line breaks as the two characters "\n";
      // turn them back into real line breaks
      key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    client = sheets({ version: "v4", auth: serviceAccount });
  }
  return client;
}

/**
 * Every row of one tab, as the sheet's raw values: ticked checkboxes are
 * true, and dates are numbers, not text in the sheet's date format.
 */
export async function readTab(tabName: string): Promise<unknown[][]> {
  const response = await sheetsClient().spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tabName}'`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return response.data.values ?? [];
}
