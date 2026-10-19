/**
 * Game Data directory helpers (UIUX §8, PRD §2.3–2.6).
 *
 * Everything rendered on /game-data/* derives from the dataset files —
 * no fabricated counts, categories, or field values. A field with
 * `value: null` is UNKNOWN and must render as "Not yet verified", never 0.
 */
import type { DataField, EvidenceRecord, SourceRecord } from "./schema/common";
import type { GameJob } from "./schema/job";
import type { GameCost } from "./schema/cost";
import type { GameSkillAction } from "./schema/action";
import type { GameLocation } from "./schema/location";

import jobsJson from "../data/jobs.json";
import housingCostsJson from "../data/housing-costs.json";
import skillsActionsJson from "../data/skills-actions.json";
import locationsJson from "../data/locations.json";
import sourcesJson from "../data/sources.json";
import evidenceJson from "../data/evidence.json";

export const jobs = jobsJson as unknown as GameJob[];
export const housingCosts = housingCostsJson as unknown as GameCost[];
export const skillsActions = skillsActionsJson as unknown as GameSkillAction[];
export const locations = locationsJson as unknown as GameLocation[];
export const sources = sourcesJson as unknown as SourceRecord[];
export const evidenceRecords = evidenceJson as unknown as EvidenceRecord[];

export type CollectionKey = "jobs" | "housing-costs" | "skills-actions" | "locations";

export type AnyGameRecord = GameJob | GameCost | GameSkillAction | GameLocation;

/** Status values the VerificationBadge component accepts (UIUX §10.2). */
export type BadgeStatus =
  | "verified"
  | "partial"
  | "needs_verification"
  | "reported"
  | "unverified"
  | "conflicted";

export interface CollectionDef {
  key: CollectionKey;
  /** Category chip label (directory index). */
  chipLabel: string;
  /** Singular record-type label shown on cards and detail pages. */
  typeLabel: string;
  records: AnyGameRecord[];
}

export const collections: CollectionDef[] = [
  { key: "jobs", chipLabel: "Jobs", typeLabel: "Job", records: jobs },
  { key: "housing-costs", chipLabel: "Housing & Costs", typeLabel: "Housing & Cost", records: housingCosts },
  { key: "skills-actions", chipLabel: "Skills & Actions", typeLabel: "Skill & Action", records: skillsActions },
  { key: "locations", chipLabel: "Locations", typeLabel: "Location", records: locations },
];

export interface FieldRow {
  key: string;
  label: string;
  field: DataField<unknown>;
  /** Pre-formatted display value; `null` means UNKNOWN ("Not yet verified"). */
  display: string | null;
}

export interface KeyField {
  label: string;
  /**
   * Pre-formatted display value; `null` means UNKNOWN — the directory card
   * must render this as "Data Pending" (Stitch kit), never as 0.
   */
  value: string | null;
}

export interface NormalizedRecord {
  slug: string;
  collection: CollectionKey;
  typeLabel: string;
  /** Display name; falls back to the record id when the name field is unknown. */
  name: string;
  nameStatus: BadgeStatus;
  /** Aggregate status across all populated fields. */
  status: BadgeStatus;
  fields: FieldRow[];
  keyFields: KeyField[];
  sourceIds: string[];
  evidenceIds: string[];
  lastReviewedAt?: string;
  /**
   * Numeric amount for directory sorting (jobs pay, housing cost), null when
   * the collection has no meaningful amount or the value is unknown.
   */
  sortAmount: number | null;
}

/* ------------------------------------------------------------------ */
/* Slugs                                                               */
/* ------------------------------------------------------------------ */

function countIdOccurrences(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const col of collections) {
    for (const rec of col.records) {
      counts.set(rec.id, (counts.get(rec.id) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Record id = slug, prefixed with the collection key when the same id
 * exists in more than one collection (e.g. a job id like "tech").
 */
export function slugFor(collection: CollectionKey, id: string, idCounts?: Map<string, number>): string {
  const counts = idCounts ?? countIdOccurrences();
  return (counts.get(id) ?? 0) > 1 ? `${collection}-${id}` : id;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const UNKNOWN_LABEL = "Not yet verified";

function formatScalar(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    return value.length === 0 ? "None recorded" : value.map((v) => String(v)).join(", ");
  }
  return String(value);
}

/** "Not yet verified" for null values — NEVER render 0 for unknown data (UIUX §8.4). */
export function displayOrUnknown(display: string | null): string {
  return display ?? UNKNOWN_LABEL;
}

function fieldOrNull(value: unknown): DataField<unknown> | null {
  if (value && typeof value === "object" && "status" in value) {
    return value as DataField<unknown>;
  }
  return null;
}

/** Currency + period shown explicitly whenever the data provides them (PRD §2.4). */
function withCurrencyAndPeriod(amount: string, currency?: string | null, period?: string | null): string {
  let out = amount;
  if (currency) out = `${currency} ${out}`;
  if (period && period !== "unknown") out = `${out} per ${period}`;
  return out;
}

function formatMinutes(minutes: number): string {
  return `${minutes} min`;
}

/* ------------------------------------------------------------------ */
/* Field metadata per collection                                       */
/* ------------------------------------------------------------------ */

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  careerGroup: "Career group",
  entryRequirements: "Entry requirements",
  payAmount: "Pay",
  payPeriod: "Pay period",
  shiftDurationMinutes: "Shift length",
  workSchedule: "Work schedule",
  requiredSkills: "Required skills",
  promotionRequirements: "Promotion requirements",
  workplace: "Workplace",
  amount: "Amount",
  currency: "Currency",
  period: "Period",
  conditions: "Conditions",
  prerequisites: "Prerequisites",
  durationMinutes: "Duration",
  costAmount: "Cost",
  costCurrency: "Cost currency",
  effectDescription: "Effect",
  locationId: "Location",
  requiredSkillIds: "Required skills",
  category: "Category",
  activities: "Activities",
  openingHours: "Opening hours",
};

/** Schema field order per collection; unknown extra keys are appended after these. */
const COLLECTION_FIELD_ORDER: Record<CollectionKey, string[]> = {
  jobs: [
    "name",
    "careerGroup",
    "entryRequirements",
    "payAmount",
    "payPeriod",
    "shiftDurationMinutes",
    "workSchedule",
    "requiredSkills",
    "promotionRequirements",
    "workplace",
  ],
  "housing-costs": [
    "name",
    "amount",
    "buyPrice",
    "moveInTotal",
    "resaleValue",
    "currency",
    "period",
    "conditions",
  ],
  "skills-actions": [
    "name",
    "prerequisites",
    "durationMinutes",
    "costAmount",
    "costCurrency",
    "effectDescription",
    "locationId",
    "requiredSkillIds",
  ],
  locations: ["name", "category", "activities", "openingHours", "entryRequirements"],
};

function prettyKey(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Per-field display (collection-aware composition)                    */
/* ------------------------------------------------------------------ */

function fieldDisplay(
  collection: CollectionKey,
  key: string,
  field: DataField<unknown>,
  record: Record<string, unknown>,
): string | null {
  const value = formatScalar(field.value);

  if (value === null) return null;

  switch (`${collection}.${key}`) {
    case "jobs.payAmount": {
      const periodField = fieldOrNull(record.payPeriod);
      const period = periodField ? formatScalar(periodField.value) : null;
      // Caliber label (P0-2): payAmount is always the level-1 entry figure;
      // the full L1–L5 ladder lives in the field notes.
      return `${withCurrencyAndPeriod(value, null, period)} · Level 1 entry`;
    }
    case "jobs.shiftDurationMinutes":
      return formatMinutes(field.value as number);
    case "housing-costs.amount": {
      const currencyField = fieldOrNull(record.currency);
      const periodField = fieldOrNull(record.period);
      return withCurrencyAndPeriod(
        value,
        currencyField ? formatScalar(currencyField.value) : null,
        periodField ? formatScalar(periodField.value) : null,
      );
    }
    // P1-2 in-game verified housing economics (2026-10-19)
    case "housing-costs.buyPrice":
      return withCurrencyAndPeriod(value, "NGN", null);
    case "housing-costs.moveInTotal":
      return withCurrencyAndPeriod(value, "NGN", "one-time");
    case "housing-costs.resaleValue":
      return `${withCurrencyAndPeriod(value, "NGN", null)} · 80% of buyout`;
    case "skills-actions.durationMinutes":
      return formatMinutes(field.value as number);
    case "skills-actions.costAmount": {
      const currencyField = fieldOrNull(record.costCurrency);
      return withCurrencyAndPeriod(value, currencyField ? formatScalar(currencyField.value) : null, null);
    }
    default:
      return value;
  }
}

/* ------------------------------------------------------------------ */
/* Key fields for directory cards                                      */
/* ------------------------------------------------------------------ */

function keyFieldsFor(collection: CollectionKey, record: Record<string, unknown>): KeyField[] {
  const get = (key: string): DataField<unknown> | null => fieldOrNull(record[key]);
  const out: KeyField[] = [];
  // A key field that EXISTS on the record but has value null is unknown —
  // keep it (cards render "Data Pending"); only skip keys absent entirely.
  const push = (label: string, display: string | null) => {
    out.push({ label, value: display });
  };

  switch (collection) {
    case "jobs": {
      const pay = get("payAmount");
      if (pay) {
        const period = get("payPeriod");
        push(
          "Pay",
          pay.value === null
            ? null
            : withCurrencyAndPeriod(
                String(pay.value),
                null,
                period && period.value !== null ? formatScalar(period.value) : null,
              ),
        );
      }
      const shift = get("shiftDurationMinutes");
      if (shift) push("Shift length", shift.value === null ? null : formatMinutes(shift.value as number));
      const workplace = get("workplace");
      if (workplace) push("Workplace", formatScalar(workplace.value));
      const group = get("careerGroup");
      if (group) push("Career group", formatScalar(group.value));
      break;
    }
    case "housing-costs": {
      const amount = get("amount");
      if (amount) {
        const currency = get("currency");
        const period = get("period");
        push(
          "Cost",
          amount.value === null
            ? null
            : withCurrencyAndPeriod(
                String(amount.value),
                currency ? formatScalar(currency.value) : null,
                period ? formatScalar(period.value) : null,
              ),
        );
      }
      const conditions = get("conditions");
      if (conditions) push("Conditions", formatScalar(conditions.value));
      break;
    }
    case "skills-actions": {
      const duration = get("durationMinutes");
      if (duration) push("Duration", duration.value === null ? null : formatMinutes(duration.value as number));
      const cost = get("costAmount");
      if (cost) {
        const currency = get("costCurrency");
        push(
          "Cost",
          cost.value === null
            ? null
            : withCurrencyAndPeriod(String(cost.value), currency ? formatScalar(currency.value) : null, null),
        );
      }
      const location = get("locationId");
      if (location) push("Location", formatScalar(location.value));
      break;
    }
    case "locations": {
      const category = get("category");
      if (category) push("Category", formatScalar(category.value));
      const hours = get("openingHours");
      if (hours) push("Opening hours", formatScalar(hours.value));
      const activities = get("activities");
      if (activities) push("Activities", formatScalar(activities.value));
      break;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Aggregate status + normalization                                    */
/* ------------------------------------------------------------------ */

function aggregateStatus(fields: DataField<unknown>[]): BadgeStatus {
  if (fields.length === 0) return "unverified";
  if (fields.every((f) => f.status === "verified")) return "verified";
  if (fields.some((f) => f.status === "verified")) return "partial";
  if (fields.some((f) => f.status === "conflicted")) return "conflicted";
  if (fields.some((f) => f.status === "reported")) return "reported";
  return "unverified";
}

export function normalizeRecord(
  collection: CollectionKey,
  record: AnyGameRecord,
  idCounts?: Map<string, number>,
): NormalizedRecord {
  const colDef = collections.find((c) => c.key === collection)!;
  const raw = record as unknown as Record<string, unknown>;

  const knownOrder = COLLECTION_FIELD_ORDER[collection];
  const presentKeys = Object.keys(raw).filter((k) => k !== "id" && k !== "lastReviewedAt");
  const orderedKeys = [
    ...knownOrder.filter((k) => presentKeys.includes(k)),
    ...presentKeys.filter((k) => !knownOrder.includes(k)),
  ];

  const fields: FieldRow[] = [];
  for (const key of orderedKeys) {
    const field = fieldOrNull(raw[key]);
    if (!field) continue;
    fields.push({
      key,
      label: FIELD_LABELS[key] ?? prettyKey(key),
      field,
      display: fieldDisplay(collection, key, field, raw),
    });
  }

  const nameField = fields.find((f) => f.key === "name");
  const sourceIds = [...new Set(fields.flatMap((f) => f.field.sourceIds ?? []))];
  const evidenceIds = [...new Set(fields.flatMap((f) => f.field.evidenceIds ?? []))];
  // Record-level review date: explicit value wins; otherwise derive from the
  // latest per-field checkedAt so a record never shows a field status while
  // claiming the review date is missing (P0-3 label consistency).
  const checkedDates = fields
    .map((f) => f.field.checkedAt)
    .filter((d): d is string => typeof d === "string" && d.length > 0)
    .sort();
  const lastReviewedAt =
    typeof raw.lastReviewedAt === "string"
      ? raw.lastReviewedAt
      : checkedDates.length > 0
        ? checkedDates[checkedDates.length - 1]
        : undefined;

  const amountField =
    collection === "jobs"
      ? fieldOrNull(raw.payAmount)
      : collection === "housing-costs"
        ? fieldOrNull(raw.amount)
        : null;
  const sortAmount =
    amountField && typeof amountField.value === "number" && Number.isFinite(amountField.value)
      ? amountField.value
      : null;

  return {
    slug: slugFor(collection, record.id, idCounts),
    collection,
    typeLabel: colDef.typeLabel,
    name: nameField?.display ?? record.id,
    nameStatus: nameField?.field.status ?? "unverified",
    status: aggregateStatus(fields.map((f) => f.field)),
    fields,
    keyFields: keyFieldsFor(collection, raw),
    sourceIds,
    evidenceIds,
    lastReviewedAt,
    sortAmount,
  };
}

const idCountsGlobal = countIdOccurrences();

/** Directory status filter bucket (Stitch status pills: verified / partial / pending). */
export type CardFilterStatus = "verified" | "partial" | "pending";

export function cardFilterStatus(status: BadgeStatus): CardFilterStatus {
  if (status === "verified") return "verified";
  if (status === "partial") return "partial";
  return "pending";
}

/** All records across every collection, normalized, with collision-safe slugs. */
export const allRecords: NormalizedRecord[] = collections.flatMap((col) =>
  col.records.map((rec) => normalizeRecord(col.key, rec, idCountsGlobal)),
);

export function totalRecordCount(): number {
  return allRecords.length;
}

export function findSource(id: string): SourceRecord | undefined {
  return sources.find((s) => s.id === id);
}

export function findEvidence(id: string): EvidenceRecord | undefined {
  return evidenceRecords.find((e) => e.id === id);
}
