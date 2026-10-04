// Reads and writes the bookings spreadsheet as the app's service account
import { auth, sheets, type sheets_v4 } from "@googleapis/sheets";
import {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SPREADSHEET_ID,
} from "astro:env/server";
import { cellAddress } from "./cells";

// Made once and reused, so the service account's access token is too
let client: sheets_v4.Sheets | undefined;

function sheetsClient(): sheets_v4.Sheets {
  if (!client) {
    const serviceAccount = new auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Netlify keeps the key's line breaks as the two characters "\n";
      // turn them back into real line breaks
      key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    client = sheets({ version: "v4", auth: serviceAccount });
  }
  return client;
}

function tabRange(tabName: string): string {
  return `'${tabName.replace(/'/g, "''")}'`;
}

/**
 * Every row of one tab, as the sheet's raw values: ticked checkboxes are
 * true, and dates are numbers, not text in the sheet's date format.
 */
export async function readTab(tabName: string): Promise<unknown[][]> {
  return (await readTabs([tabName]))[tabName];
}

/** Every row of several tabs, in one request */
export async function readTabs(
  tabNames: string[]
): Promise<Record<string, unknown[][]>> {
  const response = await sheetsClient().spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: tabNames.map(tabRange),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const tabs: Record<string, unknown[][]> = {};
  tabNames.forEach((tabName, index) => {
    tabs[tabName] = response.data.valueRanges?.[index]?.values ?? [];
  });
  return tabs;
}

export interface CellValue {
  /** 1 is the header row */
  row: number;
  /** 0 is column A */
  column: number;
  value: unknown;
}

/**
 * Writes values into cells exactly as given: the sheet doesn't guess at
 * dates or numbers, so an invoice number like "007" stays "007".
 */
export async function writeCells(
  tabName: string,
  cells: CellValue[]
): Promise<void> {
  await sheetsClient().spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: "RAW",
      data: cells.map((cell) => ({
        range: cellAddress(tabName, cell.row, cell.column),
        values: [[cell.value]],
      })),
    },
  });
}

/** Adds a row below the tab's last row, with values exactly as given */
export async function appendRow(
  tabName: string,
  values: unknown[]
): Promise<void> {
  await sheetsClient().spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabRange(tabName)}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

/** Deletes a row (1 is the header row), moving the rows below it up */
export async function deleteRow(tabName: string, row: number): Promise<void> {
  const spreadsheet = await sheetsClient().spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: "sheets.properties(sheetId,title)",
  });
  const sheetId = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === tabName
  )?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) {
    throw new Error(`The spreadsheet has no "${tabName}" tab`);
  }
  await sheetsClient().spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: row - 1,
              endIndex: row,
            },
          },
        },
      ],
    },
  });
}
