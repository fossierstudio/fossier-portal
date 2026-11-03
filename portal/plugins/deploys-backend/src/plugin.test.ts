import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  mockCredentials,
  mockServices,
  startTestBackend,
} from '@backstage/backend-test-utils';
import request from 'supertest';
import { deploysPlugin } from './plugin';

describe('plugin', () => {
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await mkdtemp(join(tmpdir(), 'deploys-'));
    await writeFile(
      join(dataDir, 'my-service.json'),
      JSON.stringify({
        description: 'test runs',
        exportedAt: '2026-11-02T00:00:00Z',
        runs: [
          { startedAt: '2026-03-04T10:00:00Z', minutes: 5, result: 'success' },
          { startedAt: '2026-03-05T10:00:00Z', minutes: 3, result: 'failure' },
        ],
      }),
    );
  });

  afterAll(() => rm(dataDir, { recursive: true }));

  const start = () =>
    startTestBackend({
      features: [
        deploysPlugin,
        mockServices.rootConfig.factory({ data: { deploys: { dataDir } } }),
      ],
    });

  it('serves a summary at /api/deploys', async () => {
    const { server } = await start();

    const response = await request(server).get(
      '/api/deploys/history/my-service',
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      deploys: 1,
      failedRuns: 1,
      failureRate: 0.5,
    });
  });

  it('requires a signed-in user', async () => {
    const { server } = await start();

    const response = await request(server)
      .get('/api/deploys/history/my-service')
      .set('Authorization', mockCredentials.none.header());

    expect(response.status).toBe(401);
  });
});
