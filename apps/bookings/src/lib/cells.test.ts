import { describe, expect, it } from "vitest";
import { cellAddress, columnLetters } from "./cells";

describe("columnLetters", () => {
  it("counts A to Z, then AA", () => {
    expect(columnLetters(0)).toBe("A");
    expect(columnLetters(25)).toBe("Z");
    expect(columnLetters(26)).toBe("AA");
    expect(columnLetters(27)).toBe("AB");
    expect(columnLetters(701)).toBe("ZZ");
    expect(columnLetters(702)).toBe("AAA");
  });
});

describe("cellAddress", () => {
  it("quotes the tab name", () => {
    expect(cellAddress("Tracking Data", 5, 1)).toBe("'Tracking Data'!B5");
    expect(cellAddress("Bob's tab", 2, 0)).toBe("'Bob''s tab'!A2");
  });
});
