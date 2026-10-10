/** PRD §4.7 + §6.5 — localStorage persistence with schema validation. */
import {
  PLANNER_SCHEMA_VERSION,
  emptyPlannerInput,
  type PlannerGoal,
  type PlannerInput,
  type SavedPlannerState,
} from "../schema/planner";

const STORAGE_KEY = "llg-planner-v1";

const GOALS: PlannerGoal[] = ["financial_stability", "career_growth", "exploration"];
const PERIODS = ["week", "day", "hour", "unknown"] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function sanitizeInput(raw: unknown): PlannerInput | null {
  if (!isRecord(raw)) return null;
  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
  const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

  const goal = GOALS.includes(raw.goal as PlannerGoal) ? (raw.goal as PlannerGoal) : null;
  const housingPeriod =
    raw.housingCostPeriod === null || PERIODS.includes(raw.housingCostPeriod as (typeof PERIODS)[number])
      ? (raw.housingCostPeriod as PlannerInput["housingCostPeriod"])
      : null;

  const skills = Array.isArray(raw.currentSkillIds)
    ? raw.currentSkillIds.filter((s): s is string => typeof s === "string")
    : [];

  const costs = Array.isArray(raw.knownRecurringCosts)
    ? raw.knownRecurringCosts
        .filter(isRecord)
        .map((c, i) => ({
          id: str(c.id) ?? `cost-${i}`,
          amount: num(c.amount) ?? 0,
          period: PERIODS.includes(c.period as (typeof PERIODS)[number])
            ? (c.period as PlannerInput["knownRecurringCosts"][number]["period"])
            : "unknown",
        }))
    : [];

  return {
    cash: num(raw.cash),
    currentJobId: str(raw.currentJobId),
    housingCost: num(raw.housingCost),
    housingCostPeriod: housingPeriod,
    knownRecurringCosts: costs,
    currentSkillIds: skills,
    goal,
  };
}

export function loadPlannerState(storage: Storage = localStorage): SavedPlannerState | null {
  try {
    const rawText = storage.getItem(STORAGE_KEY);
    if (!rawText) return null;
    const parsed: unknown = JSON.parse(rawText);
    if (!isRecord(parsed)) return null;
    if (parsed.schemaVersion !== PLANNER_SCHEMA_VERSION) return null; // LS-005: drop incompatible
    const input = sanitizeInput(parsed.input);
    if (!input) return null;
    return {
      schemaVersion: PLANNER_SCHEMA_VERSION,
      savedAt: str(parsed.savedAt) ?? new Date().toISOString(),
      input,
      completedRecommendationIds: Array.isArray(parsed.completedRecommendationIds)
        ? parsed.completedRecommendationIds.filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch {
    return null; // LS-004: corrupt JSON safely falls back
  }
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function savePlannerState(
  input: PlannerInput,
  completedRecommendationIds: string[] = [],
  storage: Storage = localStorage,
): boolean {
  try {
    const state: SavedPlannerState = {
      schemaVersion: PLANNER_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      input,
      completedRecommendationIds,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // LS-006: storage disabled / quota
  }
}

export function clearPlannerState(storage: Storage = localStorage): boolean {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export { emptyPlannerInput, STORAGE_KEY };
