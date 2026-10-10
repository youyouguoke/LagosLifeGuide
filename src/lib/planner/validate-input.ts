/** PRD §4.2 + §6.1 — numeric input validation. Unknown stays unknown. */
import type { PlannerInput, RecurringCostInput } from "../schema/planner";

export interface InputError {
  field: string;
  message: string;
}

const MAX_REASONABLE_AMOUNT = 1_000_000_000;

function checkAmount(
  field: string,
  value: number | null,
  required: boolean,
  errors: InputError[],
): void {
  if (value === null) {
    if (required) errors.push({ field, message: `${field} is required` });
    return;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    errors.push({ field, message: `${field} must be a finite number` });
    return;
  }
  if (!Number.isFinite(value)) {
    errors.push({ field, message: `${field} must be finite (no Infinity)` });
    return;
  }
  if (value < 0) {
    errors.push({ field, message: `${field} cannot be negative` });
    return;
  }
  if (value > MAX_REASONABLE_AMOUNT) {
    errors.push({ field, message: `${field} exceeds the reasonable field limit` });
  }
}

function checkCost(field: string, cost: RecurringCostInput, errors: InputError[]): void {
  checkAmount(`${field}.amount`, cost.amount, true, errors);
  if (!cost.period || cost.period === "unknown") {
    errors.push({ field: `${field}.period`, message: "cost period must be known" });
  }
}

/** Validates numeric shape. Allows nulls (unknown) for optional fields. Returns [] when valid. */
export function validateNumericInputs(input: PlannerInput): InputError[] {
  const errors: InputError[] = [];
  checkAmount("cash", input.cash, false, errors);
  checkAmount("housingCost", input.housingCost, false, errors);
  if (input.housingCost !== null && (input.housingCostPeriod === null || input.housingCostPeriod === "unknown")) {
    errors.push({ field: "housingCostPeriod", message: "housing cost period must be known when an amount is set" });
  }
  input.knownRecurringCosts.forEach((c, i) => checkCost(`knownRecurringCosts[${i}]`, c, errors));
  if (input.goal === null) {
    errors.push({ field: "goal", message: "select a goal to build a plan" });
  }
  return errors;
}
