/** One completed workflow run, as written by scripts/export-deploys.mjs. */
export type Run = {
  startedAt: string;
  minutes: number;
  result: 'success' | 'failure' | 'cancelled';
};

export type History = {
  description: string;
  /** Where successful runs deploy to. Older exports leave it out. */
  target?: string;
  exportedAt: string;
  runs: Run[];
};

export type Week = {
  /** Monday of the week, as YYYY-MM-DD in UTC. */
  start: string;
  deploys: number;
  failed: number;
};

export type Summary = {
  description: string;
  /** Where successful runs deploy to, such as production. */
  target: string;
  exportedAt: string;
  firstDeploy?: string;
  lastDeploy?: string;
  deploys: number;
  failedRuns: number;
  cancelledRuns: number;
  /** Failed runs as a share of runs that finished, from 0 to 1. */
  failureRate: number;
  medianMinutes?: number;
  p90Minutes?: number;
  weeks: Week[];
};

const DAY = 24 * 60 * 60 * 1000;

function weekStart(iso: string): number {
  const date = new Date(iso);
  const midnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  // getUTCDay() counts from Sunday; weeks here start on Monday.
  return midnight - ((date.getUTCDay() + 6) % 7) * DAY;
}

function percentile(sorted: number[], p: number): number | undefined {
  if (sorted.length === 0) {
    return undefined;
  }
  const rank = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.min(Math.max(rank, 0), sorted.length - 1)];
}

/**
 * Turns raw runs into the figures the portal shows. Successful runs count as
 * deploys; their durations are the time from push to live.
 */
export function summarize(history: History): Summary {
  const runs = [...history.runs].sort((a, b) =>
    a.startedAt.localeCompare(b.startedAt),
  );
  const deploys = runs.filter(run => run.result === 'success');
  const failedRuns = runs.filter(run => run.result === 'failure').length;
  const cancelledRuns = runs.filter(run => run.result === 'cancelled').length;
  const minutes = deploys.map(run => run.minutes).sort((a, b) => a - b);

  const weeks: Week[] = [];
  if (runs.length > 0) {
    const counts = new Map<number, Week>();
    const first = weekStart(runs[0].startedAt);
    const last = weekStart(runs[runs.length - 1].startedAt);
    for (let start = first; start <= last; start += 7 * DAY) {
      const week = {
        start: new Date(start).toISOString().slice(0, 10),
        deploys: 0,
        failed: 0,
      };
      counts.set(start, week);
      weeks.push(week);
    }
    for (const run of runs) {
      const week = counts.get(weekStart(run.startedAt))!;
      if (run.result === 'success') {
        week.deploys += 1;
      } else if (run.result === 'failure') {
        week.failed += 1;
      }
    }
  }

  const finished = deploys.length + failedRuns;
  return {
    description: history.description,
    target: history.target ?? 'production',
    exportedAt: history.exportedAt,
    firstDeploy: deploys[0]?.startedAt,
    lastDeploy: deploys[deploys.length - 1]?.startedAt,
    deploys: deploys.length,
    failedRuns,
    cancelledRuns,
    failureRate: finished === 0 ? 0 : failedRuns / finished,
    medianMinutes: percentile(minutes, 0.5),
    p90Minutes: percentile(minutes, 0.9),
    weeks,
  };
}
