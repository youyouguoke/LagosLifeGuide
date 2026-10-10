/** PRD §3.9–3.10 + §4.7 — planner input/result types and saved state. */

export type PlannerGoal =
  | "financial_stability"
  | "career_growth"
  | "exploration";

export interface RecurringCostInput {
  id: string;
  amount: number;
  period: "week" | "day" | "hour" | "unknown";
}

export interface PlannerInput {
  cash: number | null;
  currentJobId: string | null;
  housingCost: number | null;
  housingCostPeriod: "week" | "day" | "unknown" | null;
  knownRecurringCosts: RecurringCostInput[];
  currentSkillIds: string[];
  goal: PlannerGoal | null;
}

export type RecommendationStatus = "supported" | "conditional" | "blocked";

export interface PlannerRecommendation {
  id: string;
  title: string;
  reason: string;
  prerequisites: string[];
  sourceIds: string[];
  evidenceIds: string[];
  status: RecommendationStatus;
}

export interface PlannerResult {
  schemaVersion: number;
  status: "ready" | "partial" | "blocked";
  summary: string;
  budget?: {
    availableCash: number | null;
    knownCosts: Array<{ id: string; amount: number; period: string }>;
    remainingAmount: number | null;
    remainingPeriod?: string;
  };
  recommendations: PlannerRecommendation[];
  unknowns: string[];
  conflicts: string[];
  generatedAt: string;
}

export interface SavedPlannerState {
  schemaVersion: number;
  savedAt: string;
  input: PlannerInput;
  completedRecommendationIds: string[];
}

export const PLANNER_SCHEMA_VERSION = 1;

export const emptyPlannerInput: PlannerInput = {
  cash: null,
  currentJobId: null,
  housingCost: null,
  housingCostPeriod: null,
  knownRecurringCosts: [],
  currentSkillIds: [],
  goal: null,
};
