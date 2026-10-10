/** PRD §4.3 + §6.2 — per-field evidence gating. */
import type { DataField, EvidenceRecord } from "../schema/common";

export interface GameContext {
  /** Exact URL of the confirmed target game instance (PRD P0). */
  targetGameUrl: string;
  targetGameVersion?: string;
}

/**
 * A field may enter deterministic calculation only when it has a value, is
 * verified, and its evidence chain matches the target game instance (and
 * version when the field is version-specific).
 */
export function isUsableForCalculation<T>(
  field: DataField<T> | undefined | null,
  context: GameContext,
  evidence: EvidenceRecord[],
): boolean {
  if (!field) return false;
  if (field.value === null) return false;
  if (field.status !== "verified") return false;
  if (field.evidenceIds.length === 0) return false;

  const records = evidence.filter((e) => field.evidenceIds.includes(e.id));
  if (records.length === 0) return false;

  for (const record of records) {
    if (record.gameUrl !== context.targetGameUrl) return false;
    if (field.applicableVersion && context.targetGameVersion) {
      if (record.gameVersion !== context.targetGameVersion) return false;
    }
  }

  // unit/period required-but-unknown blocks summing/versioning downstream
  return true;
}

export function describeUnknown(fieldName: string, field: DataField<unknown> | undefined): string {
  if (!field) return `${fieldName}: no data recorded yet`;
  if (field.value === null) return `${fieldName}: not yet verified`;
  if (field.status === "conflicted") return `${fieldName}: sources conflict`;
  return `${fieldName}: ${field.status}`;
}
