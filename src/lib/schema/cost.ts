import type { DataField } from "./common";

/** PRD §3.6 — a housing or living cost record. */
export interface GameCost {
  id: string;
  name: DataField<string>;
  amount: DataField<number>;
  currency: DataField<string>;
  period: DataField<"once" | "hour" | "day" | "week" | "unknown">;
  conditions?: DataField<string[]>;
}
