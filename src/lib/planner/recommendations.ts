/** PRD §4.6 + §6.4 — deterministic recommendation ranking. */
import type { GameSkillAction } from "../schema/action";
import type { PlannerGoal, PlannerRecommendation } from "../schema/planner";
import { isUsableForCalculation, type GameContext } from "./evidence-gate";
import type { EvidenceRecord } from "../schema/common";

interface CandidateAssessment {
  action: GameSkillAction;
  recommendation: PlannerRecommendation;
  goalRelevant: boolean;
}

/**
 * Builds recommendations from the skills/actions dataset only. A candidate is:
 * - supported: prerequisites verified & satisfied, evidence applies to target instance
 * - conditional: prerequisite state is unknown (missing/null data)
 * - excluded (not recommended, RC-003): prerequisites verified and NOT satisfied
 * Unverified effects never produce supported claims (RC-004).
 */
export function deriveRecommendations(
  input: { currentSkillIds: string[]; goal: PlannerGoal | null },
  actions: GameSkillAction[],
  context: GameContext,
  evidence: EvidenceRecord[],
): PlannerRecommendation[] {
  const out: CandidateAssessment[] = [];

  for (const action of actions) {
    const prereq = action.prerequisites;
    const usable = isUsableForCalculation(prereq, context, evidence);
    const satisfied =
      usable &&
      prereq!.value!.every((p) => input.currentSkillIds.includes(p));

    if (usable && !satisfied) continue; // RC-003: prerequisites unmet → not recommended

    const effectUsable = isUsableForCalculation(action.effectDescription, context, evidence);
    const id = action.id;

    let rec: PlannerRecommendation;
    if (!usable) {
      rec = {
        id,
        title: action.name.value ?? id,
        reason: "Prerequisite state is not fully verified — treat as a lead, not a plan.",
        prerequisites: prereq?.value ?? [],
        sourceIds: action.name.sourceIds,
        evidenceIds: [...(prereq?.evidenceIds ?? []), ...(action.effectDescription?.evidenceIds ?? [])],
        status: "conditional",
      };
    } else if (!effectUsable) {
      rec = {
        id,
        title: action.name.value ?? id,
        reason: "Prerequisites are met, but the effect is not fully verified for this game version.",
        prerequisites: prereq!.value!,
        sourceIds: action.name.sourceIds,
        evidenceIds: action.effectDescription?.evidenceIds ?? [],
        status: "conditional",
      };
    } else {
      rec = {
        id,
        title: action.name.value ?? id,
        reason: action.effectDescription!.value!,
        prerequisites: prereq!.value!,
        sourceIds: action.name.sourceIds,
        evidenceIds: action.effectDescription!.evidenceIds,
        status: "supported",
      };
    }

    out.push({ action, recommendation: rec, goalRelevant: isGoalRelevant(action, input.goal) });
  }

  return out.sort(compareAssessments).map((a) => a.recommendation);
}

function isGoalRelevant(action: GameSkillAction, goal: PlannerGoal | null): boolean {
  if (!goal) return false;
  const group = action.name.value?.toLowerCase() ?? "";
  switch (goal) {
    case "financial_stability":
      return /work|earn|job|sell|save|budget/.test(group);
    case "career_growth":
      return /skill|train|study|promote|course/.test(group);
    case "exploration":
      return /travel|visit|explore|move|location/.test(group);
  }
}

/** PRD §4.6 order: prerequisites → evidence → blockers → goal → stable id tiebreak. */
function compareAssessments(a: CandidateAssessment, b: CandidateAssessment): number {
  const rank = (s: PlannerRecommendation["status"]) => (s === "supported" ? 0 : s === "conditional" ? 1 : 2);
  const byStatus = rank(a.recommendation.status) - rank(b.recommendation.status);
  if (byStatus !== 0) return byStatus;
  const byGoal = Number(b.goalRelevant) - Number(a.goalRelevant);
  if (byGoal !== 0) return byGoal;
  return a.recommendation.id.localeCompare(b.recommendation.id);
}
