#!/usr/bin/env node
// Exports a workflow's run history for the deploys plugin. The portal has no
// internet access, so the history is exported here with the GitHub CLI and
// shipped with the catalog. Only start times, durations, and results are kept,
// not commits or messages.
//
// The target names where a successful run deploys to, such as production or
// "the dev cluster", and the portal uses it in its labels.
//
//   node scripts/export-deploys.mjs <owner/repo> <workflow file> <branch> <target> <out.json>

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [repo, workflow, branch, target, out] = process.argv.slice(2);
if (!out) {
  console.error(
    'usage: export-deploys.mjs <owner/repo> <workflow file> <branch> <target> <out.json>',
  );
  process.exit(1);
}

const runs = JSON.parse(
  execFileSync(
    'gh',
    [
      'run',
      'list',
      '--repo',
      repo,
      '--workflow',
      workflow,
      '--branch',
      branch,
      '--status',
      'completed',
      '--limit',
      '5000',
      '--json',
      'createdAt,updatedAt,conclusion',
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  ),
);

// Runs that never started, or were skipped, say nothing about deploys.
const results = new Set(['success', 'failure', 'cancelled']);

const history = {
  description: `Completed runs of ${workflow} on ${branch}`,
  target,
  exportedAt: new Date().toISOString(),
  runs: runs
    .filter(run => results.has(run.conclusion))
    .map(run => ({
      startedAt: run.createdAt,
      minutes:
        Math.round(
          ((Date.parse(run.updatedAt) - Date.parse(run.createdAt)) / 60000) *
            10,
        ) / 10,
      result: run.conclusion,
    }))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt)),
};

writeFileSync(out, `${JSON.stringify(history, null, 2)}\n`);
console.log(`${history.runs.length} runs written to ${out}`);
