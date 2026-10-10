// Data validation: JSON parse, field-status enum, source/evidence refs, no null+verified.
// Plain node, no deps. Run: node scripts/validate-data.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "src", "data");
const ALLOWED_STATUS = new Set(["verified", "reported", "unverified", "conflicted"]);
const DATASET_FILES = ["jobs.json", "housing-costs.json", "skills-actions.json", "locations.json"];

let errors = 0;
const err = (msg) => {
  errors++;
  console.log("FAIL " + msg);
};

function loadJson(rel) {
  try {
    return JSON.parse(readFileSync(join(dataDir, rel), "utf8"));
  } catch (e) {
    err(`${rel}: does not parse as JSON (${e.message})`);
    return null;
  }
}

const sources = loadJson("sources.json");
const evidence = loadJson("evidence.json");
if (!Array.isArray(sources)) err("sources.json must be an array");
if (!Array.isArray(evidence)) err("evidence.json must be an array");
const sourceIds = new Set((sources || []).map((s) => s.id));
const evidenceIds = new Set((evidence || []).map((e) => e.id));

function checkField(dataset, recId, fieldName, f) {
  const where = `${dataset}[${recId}].${fieldName}`;
  if (!f || typeof f !== "object" || Array.isArray(f)) return err(`${where}: not a field object`);
  if (!ALLOWED_STATUS.has(f.status)) err(`${where}: bad status '${f.status}'`);
  if (!Array.isArray(f.sourceIds)) err(`${where}: sourceIds not an array`);
  else for (const id of f.sourceIds) if (!sourceIds.has(id)) err(`${where}: unknown sourceId '${id}'`);
  if (!Array.isArray(f.evidenceIds)) err(`${where}: evidenceIds not an array`);
  else for (const id of f.evidenceIds) if (!evidenceIds.has(id)) err(`${where}: unknown evidenceId '${id}'`);
  if (f.value === null && f.status === "verified") err(`${where}: null value with status verified`);
}

const counts = {};
for (const file of DATASET_FILES) {
  const data = loadJson(file);
  if (!Array.isArray(data)) {
    err(`${file}: not an array`);
    continue;
  }
  counts[file] = data.length;
  for (const rec of data) {
    if (!rec.id) err(`${file}: record without id`);
    for (const [k, v] of Object.entries(rec)) {
      if (k === "id" || k === "lastReviewedAt") continue;
      if (v && typeof v === "object" && !Array.isArray(v) && "value" in v) {
        checkField(file, rec.id, k, v);
      } else if (v && typeof v === "object" && !Array.isArray(v)) {
        err(`${file}[${rec.id}].${k}: object without 'value' — not a DataField`);
      }
    }
  }
}

console.log("---");
for (const [f, n] of Object.entries(counts)) console.log(`${f}: ${n} records`);
if (errors === 0) console.log("OK: all datasets valid");
else {
  console.log(`${errors} error(s)`);
  process.exitCode = 1;
}
