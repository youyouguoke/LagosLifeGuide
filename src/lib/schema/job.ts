import type { DataField } from "./common";

/** PRD §3.5 — a job/career record. Every field independently verified. */
export interface GameJob {
  id: string;
  name: DataField<string>;
  careerGroup?: DataField<string>;
  entryRequirements?: DataField<string[]>;
  payAmount?: DataField<number>;
  payPeriod?: DataField<"hour" | "shift" | "day" | "week" | "unknown">;
  shiftDurationMinutes?: DataField<number>;
  workSchedule?: DataField<string[]>;
  requiredSkills?: DataField<string[]>;
  promotionRequirements?: DataField<string[]>;
  workplace?: DataField<string>;
  lastReviewedAt?: string;
}
