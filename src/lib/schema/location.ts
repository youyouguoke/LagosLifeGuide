import type { DataField } from "./common";

/** PRD §3.8 — an in-game location record. */
export interface GameLocation {
  id: string;
  name: DataField<string>;
  category?: DataField<string>;
  activities?: DataField<string[]>;
  openingHours?: DataField<string>;
  entryRequirements?: DataField<string[]>;
}
