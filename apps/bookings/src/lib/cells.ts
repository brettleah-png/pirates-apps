// Spreadsheet cell addresses, like 'Tracking Data'!B5

/** The column's letters: 0 is A, 25 is Z, 26 is AA */
export function columnLetters(column: number): string {
  let letters = "";
  let remaining = column + 1;
  while (remaining > 0) {
    const index = (remaining - 1) % 26;
    letters = String.fromCharCode(65 + index) + letters;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return letters;
}

/** "'Tracking Data'!B5" for row 5 (1 is the header row) and column 1 (0 is A) */
export function cellAddress(tab: string, row: number, column: number): string {
  return `'${tab.replace(/'/g, "''")}'!${columnLetters(column)}${row}`;
}
