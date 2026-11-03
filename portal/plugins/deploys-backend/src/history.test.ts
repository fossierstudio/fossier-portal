import { History, summarize } from './history';

const history = (runs: History['runs']): History => ({
  description: 'test runs',
  exportedAt: '2026-11-02T00:00:00Z',
  runs,
});

describe('summarize', () => {
  it('counts successful runs as deploys and failed runs against them', () => {
    const summary = summarize(
      history([
        { startedAt: '2026-03-04T10:00:00Z', minutes: 5, result: 'success' },
        { startedAt: '2026-03-04T11:00:00Z', minutes: 2, result: 'failure' },
        { startedAt: '2026-03-05T10:00:00Z', minutes: 1, result: 'cancelled' },
        { startedAt: '2026-03-06T10:00:00Z', minutes: 7, result: 'success' },
        { startedAt: '2026-03-07T10:00:00Z', minutes: 6, result: 'success' },
      ]),
    );

    expect(summary).toMatchObject({
      deploys: 3,
      failedRuns: 1,
      cancelledRuns: 1,
      failureRate: 0.25,
      medianMinutes: 6,
      p90Minutes: 7,
      firstDeploy: '2026-03-04T10:00:00Z',
      lastDeploy: '2026-03-07T10:00:00Z',
    });
  });

  it('only uses successful runs for durations', () => {
    const summary = summarize(
      history([
        { startedAt: '2026-03-04T10:00:00Z', minutes: 4, result: 'success' },
        { startedAt: '2026-03-04T11:00:00Z', minutes: 90, result: 'failure' },
      ]),
    );

    expect(summary.medianMinutes).toBe(4);
    expect(summary.p90Minutes).toBe(4);
  });

  it('fills every week from the first run to the last, starting on Monday', () => {
    const summary = summarize(
      history([
        // Wednesday 4 March and Sunday 8 March share the week of 2 March.
        { startedAt: '2026-03-04T10:00:00Z', minutes: 5, result: 'success' },
        { startedAt: '2026-03-08T23:30:00Z', minutes: 5, result: 'failure' },
        { startedAt: '2026-03-23T00:10:00Z', minutes: 5, result: 'success' },
      ]),
    );

    expect(summary.weeks).toEqual([
      { start: '2026-03-02', deploys: 1, failed: 1 },
      { start: '2026-03-09', deploys: 0, failed: 0 },
      { start: '2026-03-16', deploys: 0, failed: 0 },
      { start: '2026-03-23', deploys: 1, failed: 0 },
    ]);
  });

  it('sorts runs before summarizing', () => {
    const summary = summarize(
      history([
        { startedAt: '2026-04-01T10:00:00Z', minutes: 5, result: 'success' },
        { startedAt: '2026-03-01T10:00:00Z', minutes: 5, result: 'success' },
      ]),
    );

    expect(summary.firstDeploy).toBe('2026-03-01T10:00:00Z');
    expect(summary.lastDeploy).toBe('2026-04-01T10:00:00Z');
  });

  it('handles a history with no runs', () => {
    expect(summarize(history([]))).toMatchObject({
      deploys: 0,
      failedRuns: 0,
      failureRate: 0,
      medianMinutes: undefined,
      weeks: [],
    });
  });
});
