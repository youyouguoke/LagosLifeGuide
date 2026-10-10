import { describe, expect, it } from "vitest";
import {
  clearPlannerState,
  loadPlannerState,
  savePlannerState,
  STORAGE_KEY,
} from "../../src/lib/storage/planner-storage";
import { makeInput } from "../fixtures/planner-fixtures";

function mockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } as Storage;
}

describe("LS-001..LS-007 local persistence", () => {
  it("LS-001 saving a valid plan writes storage", () => {
    const s = mockStorage();
    expect(savePlannerState(makeInput({ cash: 100 }), [], s)).toBe(true);
    expect(s.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it("LS-002 refresh restores saved input", () => {
    const s = mockStorage();
    const input = makeInput({ cash: 2500, housingCost: 500, housingCostPeriod: "week" });
    savePlannerState(input, [], s);
    const loaded = loadPlannerState(s);
    expect(loaded?.input.cash).toBe(2500);
    expect(loaded?.input.housingCost).toBe(500);
  });

  it("LS-003 clear removes the record", () => {
    const s = mockStorage();
    savePlannerState(makeInput(), [], s);
    clearPlannerState(s);
    expect(loadPlannerState(s)).toBeNull();
  });

  it("LS-004 corrupt JSON safely recovers to null", () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, "{not json!!");
    expect(loadPlannerState(s)).toBeNull();
  });

  it("LS-005 schema version change drops incompatible data", () => {
    const s = mockStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, input: {} }));
    expect(loadPlannerState(s)).toBeNull();
  });

  it("LS-006 unavailable storage reports failure without crashing", () => {
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error("disabled");
      },
      removeItem: () => {
        throw new Error("disabled");
      },
    } as unknown as Storage;
    expect(savePlannerState(makeInput(), [], broken)).toBe(false);
    expect(loadPlannerState(broken)).toBeNull();
  });

  it("LS-007 malicious/typed junk in fields is sanitized, not trusted", () => {
    const s = mockStorage();
    s.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-10-09",
        input: { cash: -5, goal: "bogus_goal", knownRecurringCosts: "not-an-array" },
        completedRecommendationIds: [1, "ok"],
      }),
    );
    const loaded = loadPlannerState(s);
    expect(loaded?.input.cash).toBeNull();
    expect(loaded?.input.goal).toBeNull();
    expect(loaded?.input.knownRecurringCosts).toEqual([]);
    expect(loaded?.completedRecommendationIds).toEqual(["ok"]);
  });
});
