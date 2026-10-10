import { describe, expect, it } from "vitest";
import { buildPlan } from "../../src/lib/planner/build-plan";
import { deriveRecommendations } from "../../src/lib/planner/recommendations";
import { makeInput, fixtureActions, fixtureContext, fixtureEvidence } from "../fixtures/planner-fixtures";

describe("RC-001..RC-008 recommendations", () => {
  it("RC-001 verified prerequisites met → supported", () => {
    const recs = deriveRecommendations(
      { currentSkillIds: ["skill-a"], goal: "financial_stability" },
      fixtureActions,
      fixtureContext,
      fixtureEvidence,
    );
    const supported = recs.find((r) => r.id === "act-supported");
    expect(supported?.status).toBe("supported");
  });

  it("RC-002 unknown prerequisites → conditional", () => {
    const recs = deriveRecommendations(
      { currentSkillIds: [], goal: "financial_stability" },
      fixtureActions,
      fixtureContext,
      fixtureEvidence,
    );
    expect(recs.find((r) => r.id === "act-conditional-unknown-prereq")?.status).toBe("conditional");
  });

  it("RC-003 prerequisites unmet → not recommended", () => {
    const recs = deriveRecommendations(
      { currentSkillIds: [], goal: "financial_stability" },
      fixtureActions,
      fixtureContext,
      fixtureEvidence,
    );
    expect(recs.find((r) => r.id === "act-unmet-prereq")).toBeUndefined();
  });

  it("RC-004 unverified pay/effect never ranks as supported", () => {
    const recs = deriveRecommendations(
      { currentSkillIds: [], goal: "financial_stability" },
      fixtureActions,
      fixtureContext,
      fixtureEvidence,
    );
    expect(recs.find((r) => r.id === "act-reported-effect")?.status).toBe("conditional");
  });

  it("RC-005 changing goal only reorders, never changes facts", () => {
    const a = deriveRecommendations({ currentSkillIds: ["skill-a"], goal: "financial_stability" }, fixtureActions, fixtureContext, fixtureEvidence);
    const b = deriveRecommendations({ currentSkillIds: ["skill-a"], goal: "exploration" }, fixtureActions, fixtureContext, fixtureEvidence);
    expect(a.map((r) => r.id).sort()).toEqual(b.map((r) => r.id).sort());
  });

  it("RC-006 data version change recalculates (gate flips usability)", () => {
    const otherContext = { targetGameUrl: "https://other-game.test/" };
    const recs = deriveRecommendations({ currentSkillIds: ["skill-a"], goal: null }, fixtureActions, otherContext, fixtureEvidence);
    expect(recs.find((r) => r.id === "act-supported")?.status).toBe("conditional");
  });

  it("RC-007 all data missing → explicit insufficiency note", () => {
    const result = buildPlan(makeInput(), { actions: [] }, fixtureContext, fixtureEvidence);
    expect(result.status).toBe("blocked");
    expect(result.unknowns.join(" ")).toMatch(/No verified skills\/actions/);
  });

  it("RC-008 equal priorities use stable secondary sort (by id)", () => {
    const recs = deriveRecommendations({ currentSkillIds: [], goal: null }, fixtureActions, fixtureContext, fixtureEvidence);
    const ids = recs.map((r) => r.id);
    expect(ids).toEqual([...ids].sort((x, y) => x.localeCompare(y)));
  });
});
