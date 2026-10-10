/** PRD §4.4 — planner main flow: validate → gate → budget → recommend. */
import type { GameSkillAction } from "../schema/action";
import type { EvidenceRecord } from "../schema/common";
import type { PlannerInput, PlannerResult } from "../schema/planner";
import { PLANNER_SCHEMA_VERSION } from "../schema/planner";
import { calculateKnownBudget } from "./budget";
import type { GameContext } from "./evidence-gate";
import { deriveRecommendations } from "./recommendations";
import { validateNumericInputs } from "./validate-input";

export interface PlannerDataset {
  actions: GameSkillAction[];
}

export function buildPlan(
  input: PlannerInput,
  dataset: PlannerDataset,
  context: GameContext,
  evidence: EvidenceRecord[],
): PlannerResult {
  const errors = validateNumericInputs(input);
  if (errors.length > 0) {
    return {
      schemaVersion: PLANNER_SCHEMA_VERSION,
      status: "blocked",
      summary: "Some inputs need attention before a plan can be built.",
      recommendations: [],
      unknowns: [],
      conflicts: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const budget = calculateKnownBudget(input);
  const unknowns: string[] = [...budget.reasons];
  const conflicts: string[] = [];

  const recommendations = deriveRecommendations(input, dataset.actions, context, evidence);
  if (dataset.actions.length === 0) {
    unknowns.push("No verified skills/actions data is published yet — no action recommendations available.");
  }

  const status: PlannerResult["status"] =
    errors.length > 0 || (recommendations.length === 0 && unknowns.length > 0)
      ? "blocked"
      : budget.partial || recommendations.some((r) => r.status !== "supported")
        ? "partial"
        : "ready";

  return {
    schemaVersion: PLANNER_SCHEMA_VERSION,
    status,
    summary:
      status === "ready"
        ? "Plan built from verified data."
        : status === "partial"
          ? "Plan built with known gaps — review unknowns before acting."
          : "Not enough verified information for a reliable plan.",
    budget: {
      availableCash: budget.availableCash,
      knownCosts: budget.knownCosts,
      remainingAmount: budget.remainingAmount,
      remainingPeriod: budget.remainingPeriod,
    },
    recommendations,
    unknowns,
    conflicts,
    generatedAt: new Date().toISOString(),
  };
}
