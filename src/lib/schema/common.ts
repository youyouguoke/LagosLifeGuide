/** PRD §3.1–3.4 — shared verification enums and source/evidence/data-field records. */

export type VerificationStatus =
  | "verified"
  | "reported"
  | "unverified"
  | "conflicted";

export type EvidenceType =
  | "official"
  | "in_game_test"
  | "community_report"
  | "third_party_guide";

export type DataScope = "game_instance" | "game_version" | "unknown";

export interface SourceRecord {
  id: string;
  url: string;
  title?: string;
  publisher?: string;
  evidenceType: EvidenceType;
  /** ISO date the source was last accessed and reviewed. */
  accessedAt: string;
  applicableGameUrl?: string;
  applicableVersion?: string;
  notes?: string;
}

export type EvidenceMethod = "document_review" | "in_game_test" | "community_review";

export interface EvidenceRecord {
  id: string;
  sourceId: string;
  method: EvidenceMethod;
  /** ISO date the observation was made. */
  observedAt: string;
  gameUrl: string;
  gameVersion?: string;
  observation?: string;
  /** Project-internal path to screenshot/recording/test log. Never invent paths. */
  artifactPath?: string;
  reviewer?: string;
}

export type CostPeriod = "once" | "hour" | "day" | "week" | "unknown";

/**
 * Every field that can affect a calculation carries its own verification state.
 * `value: null` means UNKNOWN — never treat it as zero.
 */
export interface DataField<T> {
  value: T | null;
  unit?: string;
  period?: CostPeriod;
  status: VerificationStatus;
  sourceIds: string[];
  evidenceIds: string[];
  checkedAt?: string;
  applicableVersion?: string;
  notes?: string;
}

export function unknownField<T>(): DataField<T> {
  return { value: null, status: "unverified", sourceIds: [], evidenceIds: [] };
}
