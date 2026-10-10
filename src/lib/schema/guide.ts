import type { VerificationStatus } from "./common";

/**
 * PRD §2.7 / UIUX §9 — a long-form guide post.
 *
 * Guides are practical answers to player questions. Every published guide must
 * carry its own verification state; nothing may be fabricated to fill the index
 * (UIUX §8.4: render an empty state instead).
 */
export interface GuideSection {
  heading: string;
  body: string;
}

export interface GuidePost {
  /** URL-safe identifier, e.g. "first-week-budget". */
  slug: string;
  title: string;
  /** One-to-two sentence practical summary shown on cards. */
  summary: string;
  /** Topic label, e.g. "Housing", "Jobs", "Getting Started". */
  topic: string;
  /** Guide-level verification state (verified / partial / needs_verification). */
  verificationStatus: "verified" | "partial" | "needs_verification";
  /** ISO date the guide content was last updated/verified. */
  updatedAt: string;
  sections: GuideSection[];
  /** Ids into src/data/sources.json. Never invent ids. */
  sourceIds: string[];
}

/** Narrow helper: the guide-level statuses are a subset of the field-level enum. */
export type GuideVerificationStatus = Extract<
  VerificationStatus,
  "verified" | "partial" | "needs_verification"
>;
