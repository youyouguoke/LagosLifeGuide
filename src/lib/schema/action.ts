import type { DataField } from "./common";

/** PRD §3.7 — a skill, training, or player action record. */
export interface GameSkillAction {
  id: string;
  name: DataField<string>;
  prerequisites?: DataField<string[]>;
  durationMinutes?: DataField<number>;
  costAmount?: DataField<number>;
  costCurrency?: DataField<string>;
  effectDescription?: DataField<string>;
  locationId?: DataField<string>;
  requiredSkillIds?: DataField<string[]>;
}
