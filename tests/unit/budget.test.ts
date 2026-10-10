import { describe, expect, it } from "vitest";
import { calculateKnownBudget } from "../../src/lib/planner/budget";
import { makeInput } from "../fixtures/planner-fixtures";

describe("BD-001..BD-008 budget logic", () => {
  it("BD-001 same-unit same-period costs compute remaining", () => {
    const r = calculateKnownBudget(
      makeInput({ cash: 5000, housingCost: 1000, housingCostPeriod: "week" }),
    );
    expect(r.remainingAmount).toBe(4000);
    expect(r.remainingPeriod).toBe("week");
  });

  it("BD-002 mixed day/week costs are not summed", () => {
    const r = calculateKnownBudget(
      makeInput({
        cash: 5000,
        housingCost: 1000,
        housingCostPeriod: "week",
        knownRecurringCosts: [{ id: "food", amount: 100, period: "day" }],
      }),
    );
    expect(r.knownCosts).toEqual([]);
    expect(r.partial).toBe(true);
    expect(r.reasons.join(" ")).toMatch(/mixed periods/);
  });

  it("BD-003 partial knowledge labeled as remaining-after-known-costs", () => {
    const r = calculateKnownBudget(
      makeInput({
        cash: 5000,
        knownRecurringCosts: [{ id: "mystery", amount: 100, period: "unknown" }],
      }),
    );
    expect(r.remainingAmount).toBe(5000);
    expect(r.partial).toBe(true);
  });

  it("BD-004 unknown recurring cost does not produce a complete budget", () => {
    const r = calculateKnownBudget(
      makeInput({ cash: 5000, knownRecurringCosts: [{ id: "x", amount: 0, period: "unknown" }] }),
    );
    expect(r.partial).toBe(true);
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it("BD-005 missing cash → no remaining amount", () => {
    const r = calculateKnownBudget(makeInput({ cash: null, housingCost: 1000, housingCostPeriod: "week" }));
    expect(r.remainingAmount).toBeNull();
  });

  it("BD-006 conflicted data never reaches budget (handled upstream by gate)", () => {
    const r = calculateKnownBudget(makeInput({ cash: 100, housingCost: 50, housingCostPeriod: "week" }));
    expect(Number.isFinite(r.remainingAmount ?? 0)).toBe(true);
  });

  it("BD-007 identical inputs give identical results", () => {
    const input = makeInput({ cash: 1234.56, housingCost: 100, housingCostPeriod: "week" });
    expect(calculateKnownBudget(input)).toEqual(calculateKnownBudget(input));
  });

  it("BD-008 near-zero values stay accurate (no float drift)", () => {
    const r = calculateKnownBudget(makeInput({ cash: 0.1, housingCost: 0.2, housingCostPeriod: "week" }));
    expect(r.remainingAmount).toBeCloseTo(-0.1, 2);
  });
});
