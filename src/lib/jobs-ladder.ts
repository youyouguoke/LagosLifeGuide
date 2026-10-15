/**
 * Jobs ladder utilities (P1-1 /jobs/ hub).
 *
 * payAmount is always the Level-1 entry figure; the full L1–L5 ladder is
 * documented in the payAmount field notes as "L1 Title — N9,900; ...".
 * These helpers parse that ladder and derive a record's city from its id
 * prefix (abj* = Abuja, ph* = Port Harcourt, otherwise Lagos).
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

export function cityFromId(id: string): "Lagos" | "Abuja" | "Port Harcourt" {
  if (id.startsWith("abj")) return "Abuja";
  if (id.startsWith("ph")) return "Port Harcourt";
  return "Lagos";
}

export function formatNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}
