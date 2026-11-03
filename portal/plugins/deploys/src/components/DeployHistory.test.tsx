import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { DeploySummary, deploysApiRef } from '../api';
import { DeployHistory } from './DeployHistory';

const summary: DeploySummary = {
  description: 'Completed runs of deploy.yml on main',
  exportedAt: '2026-11-02T00:00:00Z',
  firstDeploy: '2026-03-04T03:20:00Z',
  lastDeploy: '2026-11-01T18:44:43Z',
  deploys: 482,
  failedRuns: 80,
  cancelledRuns: 26,
  failureRate: 80 / 562,
  medianMinutes: 5.8,
  p90Minutes: 8.6,
  weeks: [
    { start: '2026-03-02', deploys: 12, failed: 3 },
    { start: '2026-03-09', deploys: 0, failed: 0 },
  ],
};

const entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-service',
    annotations: { 'fossier.studio/deploy-history': 'my-service' },
  },
  spec: {},
};

describe('DeployHistory', () => {
  it('shows the summary for the entity named in the annotation', async () => {
    const getHistory = jest.fn().mockResolvedValue(summary);

    await renderInTestApp(
      <EntityProvider entity={entity}>
        <DeployHistory />
      </EntityProvider>,
      { apis: [[deploysApiRef, { getHistory }]] },
    );

    expect(await screen.findByText('482')).toBeInTheDocument();
    expect(screen.getByText('5.8 min')).toBeInTheDocument();
    expect(screen.getByText('90% within 8.6 min')).toBeInTheDocument();
    expect(screen.getByText('14% of finished runs')).toBeInTheDocument();
    expect(screen.getByText('since Mar 4, 2026')).toBeInTheDocument();
    expect(
      screen.getByTitle('Week of Mar 2, 2026: 12 deploys, 3 failed'),
    ).toBeInTheDocument();
    expect(getHistory).toHaveBeenCalledWith('my-service');
  });

  it('shows an error when the history cannot be loaded', async () => {
    const getHistory = jest.fn().mockRejectedValue(new Error('No history'));

    await renderInTestApp(
      <EntityProvider entity={entity}>
        <DeployHistory />
      </EntityProvider>,
      { apis: [[deploysApiRef, { getHistory }]] },
    );

    expect(await screen.findByText('Error: No history')).toBeInTheDocument();
  });
});
