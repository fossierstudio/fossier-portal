import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mockErrorHandler, mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

describe('createRouter', () => {
  let dataDir: string;
  let app: express.Express;

  beforeAll(async () => {
    dataDir = await mkdtemp(join(tmpdir(), 'deploys-'));
    await writeFile(
      join(dataDir, 'my-service.json'),
      JSON.stringify({
        description: 'test runs',
        exportedAt: '2026-11-02T00:00:00Z',
        runs: [
          { startedAt: '2026-03-04T10:00:00Z', minutes: 5, result: 'success' },
        ],
      }),
    );
    await writeFile(join(dataDir, 'broken.json'), '{ not json');

    const router = await createRouter({
      dataDir,
      logger: mockServices.logger.mock(),
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  afterAll(() => rm(dataDir, { recursive: true }));

  it('returns the summary for a history', async () => {
    const response = await request(app).get('/history/my-service');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ deploys: 1, medianMinutes: 5 });
  });

  it('returns 404 for a history that does not exist', async () => {
    const response = await request(app).get('/history/other-service');

    expect(response.status).toBe(404);
  });

  it('rejects names that could reach other files', async () => {
    for (const name of ['..%2Fsecret', 'My-Service', '.hidden', 'a.b']) {
      const response = await request(app).get(`/history/${name}`);
      expect(response.status).toBe(400);
    }
  });

  it('fails without exposing the file when a history is unreadable', async () => {
    const response = await request(app).get('/history/broken');

    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain(dataDir);
  });
});
