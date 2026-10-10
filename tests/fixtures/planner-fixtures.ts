/** PRD §6 — all values here are ARTIFICIAL test fixtures, never real game data. */
import type { EvidenceRecord } from "../../src/lib/schema/common";
import type { GameSkillAction } from "../../src/lib/schema/action";
import type { PlannerInput } from "../../src/lib/schema/planner";
import type { GameContext } from "../../src/lib/planner/evidence-gate";
import { emptyPlannerInput } from "../../src/lib/schema/planner";

export const fixtureContext: GameContext = {
  targetGameUrl: "https://game.test/",
  targetGameVersion: "1.0",
};

export const fixtureEvidence: EvidenceRecord[] = [
  {
    id: "ev-verified",
    sourceId: "src-test",
    method: "in_game_test",
    observedAt: "2026-10-09",
    gameUrl: "https://game.test/",
    gameVersion: "1.0",
  },
  {
    id: "ev-other-instance",
    sourceId: "src-test-other",
    method: "document_review",
    observedAt: "2026-10-09",
    gameUrl: "https://other-game.test/",
  },
  {
    id: "ev-old-version",
    sourceId: "src-test",
    method: "in_game_test",
    observedAt: "2026-09-01",
    gameUrl: "https://game.test/",
    gameVersion: "0.9",
  },
];

export function makeInput(overrides: Partial<PlannerInput> = {}): PlannerInput {
  return { ...emptyPlannerInput, goal: "financial_stability", ...overrides };
}

export const fixtureActions: GameSkillAction[] = [
  {
    id: "act-supported",
    name: {
      value: "Fixture Work Shift",
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    prerequisites: {
      value: ["skill-a"],
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    effectDescription: {
      value: "Earns fixture income.",
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
  },
  {
    id: "act-conditional-unknown-prereq",
    name: {
      value: "Fixture Training",
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    prerequisites: {
      value: null,
      status: "unverified",
      sourceIds: [],
      evidenceIds: [],
    },
    effectDescription: {
      value: null,
      status: "unverified",
      sourceIds: [],
      evidenceIds: [],
    },
  },
  {
    id: "act-unmet-prereq",
    name: {
      value: "Fixture Advanced Job",
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    prerequisites: {
      value: ["skill-missing"],
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    effectDescription: {
      value: "Earns more.",
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
  },
  {
    id: "act-reported-effect",
    name: {
      value: "Fixture Gig",
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    prerequisites: {
      value: [],
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    effectDescription: {
      value: "Community claims it pays well.",
      status: "reported",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
  },
  {
    id: "act-conflicted",
    name: {
      value: "Fixture Conflicted Action",
      status: "verified",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
    prerequisites: {
      value: null,
      status: "conflicted",
      sourceIds: ["src-test"],
      evidenceIds: ["ev-verified"],
    },
  },
];
