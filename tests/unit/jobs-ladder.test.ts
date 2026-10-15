import { describe, expect, it } from "vitest";
import { cityFromId, formatNaira, parseLadder } from "../../src/lib/jobs-ladder";

describe("parseLadder", () => {
  it("parses the standard five-step ladder", () => {
    const steps = parseLadder(
      "Level-1 pay (Intern). Full verified ladder: L1 Intern — N9,900; L2 Junior Dev — N19,500; L3 Senior Dev — N32,800; L4 Tech Lead — N47,300; L5 CTO — N76,500",
    );
    expect(steps).toHaveLength(5);
    expect(steps[0]).toEqual({ level: 1, title: "Intern", pay: 9900 });
    expect(steps[4]).toEqual({ level: 5, title: "CTO", pay: 76500 });
  });

  it("handles hyphenated titles via the em-dash separator", () => {
    const steps = parseLadder("L1 A — N1,000; L2 Co-Founder — N5,000");
    expect(steps).toHaveLength(2);
    expect(steps[1].title).toBe("Co-Founder");
    expect(steps[1].pay).toBe(5000);
  });

  it("returns an empty list when no ladder is documented", () => {
    expect(parseLadder(undefined)).toEqual([]);
    expect(parseLadder("In-game corroboration only, no ladder")).toEqual([]);
  });
});

describe("cityFromId", () => {
  it("maps id prefixes to cities", () => {
    expect(cityFromId("tech")).toBe("Lagos");
    expect(cityFromId("abjKeke")).toBe("Abuja");
    expect(cityFromId("phFerry")).toBe("Port Harcourt");
  });
});

describe("formatNaira", () => {
  it("formats with thousands separators", () => {
    expect(formatNaira(96000)).toBe("₦96,000");
  });
});
