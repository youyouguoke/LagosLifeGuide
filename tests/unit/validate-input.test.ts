import { describe, expect, it } from "vitest";
import { validateNumericInputs } from "../../src/lib/planner/validate-input";
import { makeInput } from "../fixtures/planner-fixtures";

describe("PL-001..PL-010 input validation", () => {
  it("PL-001 valid cash and costs pass", () => {
    const input = makeInput({
      cash: 5000,
      housingCost: 1000,
      housingCostPeriod: "week",
      knownRecurringCosts: [{ id: "food", amount: 200, period: "week" }],
    });
    expect(validateNumericInputs(input)).toEqual([]);
  });

  it("PL-002 empty cash is allowed but noted (no budget conclusion)", () => {
    const errors = validateNumericInputs(makeInput({ cash: null }));
    expect(errors.filter((e) => e.field === "cash")).toEqual([]);
  });

  it("PL-003 negative cash shows an input error", () => {
    expect(validateNumericInputs(makeInput({ cash: -100 })).length).toBeGreaterThan(0);
  });

  it("PL-004 non-numeric amount shows an input error", () => {
    const bad = makeInput() as unknown as Record<string, unknown>;
    bad.cash = "five thousand";
    expect(validateNumericInputs(bad as never).length).toBeGreaterThan(0);
  });

  it("PL-005 Infinity is rejected", () => {
    expect(validateNumericInputs(makeInput({ cash: Infinity })).length).toBeGreaterThan(0);
  });

  it("PL-006 empty optional cost is not auto-converted to zero", () => {
    const input = makeInput({ housingCost: null });
    const errors = validateNumericInputs(input);
    expect(errors).toEqual([]);
    expect(input.housingCost).toBeNull();
  });

  it("PL-007 negative expense rejected by default", () => {
    expect(
      validateNumericInputs(
        makeInput({ knownRecurringCosts: [{ id: "x", amount: -5, period: "week" }] }),
      ).length,
    ).toBeGreaterThan(0);
  });

  it("PL-008 no job selected is allowed", () => {
    expect(validateNumericInputs(makeInput({ currentJobId: null })).length).toBe(0);
  });

  it("PL-009 missing goal shows a validation hint", () => {
    expect(validateNumericInputs(makeInput({ goal: null })).length).toBeGreaterThan(0);
  });

  it("PL-010 input beyond reasonable limits errors without crashing", () => {
    expect(validateNumericInputs(makeInput({ cash: 9_999_999_999_999 })).length).toBeGreaterThan(0);
  });
});
