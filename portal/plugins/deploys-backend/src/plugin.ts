import { resolve } from 'node:path';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';

/**
 * Serves deploy history exported from CI, summarized into deploy counts,
 * durations, and failed runs.
 *
 * @public
 */
export const deploysPlugin = createBackendPlugin({
  pluginId: 'deploys',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ config, logger, httpRouter }) {
        // Relative to the backend's working directory, like catalog file locations.
        const dataDir = resolve(config.getString('deploys.dataDir'));
        logger.info(`Reading deploy history from ${dataDir}`);
        httpRouter.use(await createRouter({ dataDir, logger }));
      },
    });
  },
});
