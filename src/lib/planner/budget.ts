/** PRD §4.5 + §6.3 — budget rules. Only compatible, known costs may be summed. */
import type { PlannerInput } from "../schema/planner";

export interface BudgetResult {
  availableCash: number | null;
  knownCosts: Array<{ id: string; amount: number; period: string }>;
  remainingAmount: number | null;
  /** Set when only same-period costs were summed. */
  remainingPeriod?: string;
  /** True when some known costs were excluded (mixed/unknown periods or missing cash). */
  partial: boolean;
  reasons: string[];
}

/**
 * Sums only costs that share one known period. Mixed day/week costs are NOT
 * summed (BD-002). Result is always labeled "remaining after known costs"
 * (BD-003) — never a true total balance.
 */
export function calculateKnownBudget(input: PlannerInput): BudgetResult {
  const reasons: string[] = [];
  const costs: Array<{ id: string; amount: number; period: string }> = [];

  if (input.housingCost !== null && input.housingCostPeriod && input.housingCostPeriod !== "unknown") {
    costs.push({ id: "housing", amount: input.housingCost, period: input.housingCostPeriod });
  }
  for (const c of input.knownRecurringCosts) {
    if (c.period !== "unknown") {
      costs.push({ id: c.id, amount: c.amount, period: c.period });
    } else {
      reasons.push(`cost "${c.id}" has an unknown period and was excluded`);
    }
  }

  const periods = new Set(costs.map((c) => c.period));
  let partial = reasons.length > 0;
  let usable = costs;

  if (periods.size > 1) {
    // No verified conversion rules exist yet — do not sum across periods.
    reasons.push("costs use mixed periods (day/week/hour); no verified conversion, nothing summed");
    usable = [];
    partial = true;
  }

  const remainingAmount = input.cash !== null && usable.length > 0
    ? round2(input.cash - usable.reduce((sum, c) => sum + c.amount, 0))
    : input.cash !== null && usable.length === 0 && periods.size <= 1
      ? round2(input.cash)
      : null;

  if (input.cash === null) {
    reasons.push("cash is unknown — remaining cannot be calculated");
  }

  return {
    availableCash: input.cash,
    knownCosts: usable,
    remainingAmount,
    remainingPeriod: usable.length > 0 ? usable[0].period : undefined,
    partial,
    reasons,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
