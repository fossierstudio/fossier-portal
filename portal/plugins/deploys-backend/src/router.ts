import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LoggerService } from '@backstage/backend-plugin-api';
import { InputError, NotFoundError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { History, summarize } from './history';

// History names come from an entity annotation and become file names, so
// they're limited to what a file name needs.
const NAME = /^[a-z0-9][a-z0-9-]{0,62}$/;

export async function createRouter({
  dataDir,
  logger,
}: {
  dataDir: string;
  logger: LoggerService;
}): Promise<express.Router> {
  const router = Router();

  router.get('/history/:name', async (req, res) => {
    const { name } = req.params;
    if (!NAME.test(name)) {
      throw new InputError(`Invalid history name '${name}'`);
    }

    let history: History;
    try {
      history = JSON.parse(
        await readFile(resolve(dataDir, `${name}.json`), 'utf8'),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundError(`No deploy history named '${name}'`);
      }
      logger.error(`Could not read deploy history '${name}'`, error as Error);
      throw error;
    }

    res.json(summarize(history));
  });

  return router;
}
