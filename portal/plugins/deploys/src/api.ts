import { createApiRef, FetchApi } from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';

/** The summary served by the deploys backend at /history/:name. */
export type DeploySummary = {
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
  weeks: Array<{ start: string; deploys: number; failed: number }>;
};

/** @public */
export interface DeploysApi {
  getHistory(name: string): Promise<DeploySummary>;
}

/** @public */
export const deploysApiRef = createApiRef<DeploysApi>({
  id: 'plugin.deploys',
});

export class DeploysClient implements DeploysApi {
  constructor(private readonly fetchApi: FetchApi) {}

  async getHistory(name: string): Promise<DeploySummary> {
    const response = await this.fetchApi.fetch(
      `plugin://deploys/history/${encodeURIComponent(name)}`,
    );
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }
}
