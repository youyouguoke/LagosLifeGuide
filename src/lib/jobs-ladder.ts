/**
 * Jobs ladder utilities (P1-1 /jobs/ hub).
 *
 * payAmount is always the Level-1 entry figure; the full L1–L5 ladder is
 * documented in field notes as "L1 Title — N9,900; ...". Most jobs keep the
 * ladder in payAmount.notes; a few (e.g. banking) keep it in
 * promotionRequirements.notes — both come from the same client data and
 * agree wherever they overlap, so ladderForJob merges them.
 * Unknown levels stay out — the UI renders "Data Pending" for them.
 */

export interface LadderStep {
  level: number;
  title: string;
  pay: number;
}

const LADDER_STEP = /L(\d)\s+(.+?)\s*—\s*N?([\d,]+)/g;

export function parseLadder(notes: string | undefined | null): LadderStep[] {
  if (!notes) return [];
  const steps: LadderStep[] = [];
  for (const m of notes.matchAll(LADDER_STEP)) {
    steps.push({
      level: Number(m[1]),
      title: m[2].trim(),
      pay: Number(m[3].replace(/,/g, "")),
    });
  }
  return steps.sort((a, b) => a.level - b.level);
}

/** Merge the payAmount.notes and promotionRequirements.notes ladders (dedupe by level). */
export function ladderForJob(job: {
  payAmount?: { notes?: string | null } | null;
  promotionRequirements?: { notes?: string | null } | null;
}): LadderStep[] {
  const byLevel = new Map<number, LadderStep>();
  for (const step of [
    ...parseLadder(job.payAmount?.notes ?? undefined),
    ...parseLadder(job.promotionRequirements?.notes ?? undefined),
  ]) {
    if (!byLevel.has(step.level)) byLevel.set(step.level, step);
  }
  return [...byLevel.values()].sort((a, b) => a.level - b.level);
}

/**
 * City for a career, derived from its WORKPLACE location id — job ids are not
 * reliable (civilService is in Abuja despite the id). Location ids starting
 * with "abj" or "ph" mark the other two cities; everything else is Lagos.
 */
export function cityFromWorkplace(
  workplaceId: string | null | undefined,
): "Lagos" | "Abuja" | "Port Harcourt" {
  if (!workplaceId) return "Lagos";
  if (workplaceId.startsWith("abj")) return "Abuja";
  if (workplaceId.startsWith("ph")) return "Port Harcourt";
  return "Lagos";
}

export function cityFromId(id: string): "Lagos" | "Abuja" | "Port Harcourt" {
  if (id.startsWith("abj")) return "Abuja";
  if (id.startsWith("ph")) return "Port Harcourt";
  return "Lagos";
}

export function formatNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}
