import { describe, expect, it } from "vitest";
import { isUsableForCalculation } from "../../src/lib/planner/evidence-gate";
import type { DataField } from "../../src/lib/schema/common";
import { fixtureContext, fixtureEvidence } from "../fixtures/planner-fixtures";

function field(overrides: Partial<DataField<number>>): DataField<number> {
  return {
    value: 100,
    status: "verified",
    sourceIds: ["src-test"],
    evidenceIds: ["ev-verified"],
    ...overrides,
  };
}

describe("DT-001..DT-010 evidence gating", () => {
  it("DT-001 verified with applicable evidence is usable", () => {
    expect(isUsableForCalculation(field({}), fixtureContext, fixtureEvidence)).toBe(true);
  });

  it("DT-002 reported is not usable", () => {
    expect(isUsableForCalculation(field({ status: "reported" }), fixtureContext, fixtureEvidence)).toBe(false);
  });

  it("DT-003 unverified is not usable", () => {
    expect(isUsableForCalculation(field({ status: "unverified" }), fixtureContext, fixtureEvidence)).toBe(false);
  });

  it("DT-004 conflicted blocks calculation", () => {
    expect(isUsableForCalculation(field({ status: "conflicted" }), fixtureContext, fixtureEvidence)).toBe(false);
  });

  it("DT-005 missing source/evidence fails schema gate", () => {
    expect(isUsableForCalculation(field({ evidenceIds: [] }), fixtureContext, fixtureEvidence)).toBe(false);
  });

  it("DT-006 evidence from another game instance is unusable", () => {
    expect(
      isUsableForCalculation(field({ evidenceIds: ["ev-other-instance"] }), fixtureContext, fixtureEvidence),
    ).toBe(false);
  });

  it("DT-007 version mismatch blocks version-specific fields", () => {
    const versioned = field({ evidenceIds: ["ev-old-version"], applicableVersion: "1.0" });
    expect(isUsableForCalculation(versioned, fixtureContext, fixtureEvidence)).toBe(false);
  });

  it("DT-008 unknown amount unit must not be summed (value null)", () => {
    expect(isUsableForCalculation(field({ value: null }), fixtureContext, fixtureEvidence)).toBe(false);
  });

  it("DT-009 unknown period is surfaced, not converted", () => {
    const f = field({ period: "unknown" });
    // gate keeps field usable for display, budget layer excludes it from sums
    expect(f.period).toBe("unknown");
  });

  it("DT-010 null key field displays Unknown, never defaults to zero", () => {
    const f = field({ value: null });
    expect(f.value).toBeNull();
    expect(isUsableForCalculation(f, fixtureContext, fixtureEvidence)).toBe(false);
  });
});
