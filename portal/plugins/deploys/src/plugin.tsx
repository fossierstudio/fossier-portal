import {
  ApiBlueprint,
  createFrontendPlugin,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { DeploysClient, deploysApiRef } from './api';
import { DEPLOY_HISTORY_ANNOTATION } from './annotation';

export const deploysApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: deploysApiRef,
      deps: { fetchApi: fetchApiRef },
      factory: ({ fetchApi }) => new DeploysClient(fetchApi),
    }),
});

/** Adds a Deploys tab to entities that name a deploy history. */
export const deploysEntityContent = EntityContentBlueprint.make({
  params: {
    path: 'deploys',
    title: 'Deploys',
    filter: entity =>
      Boolean(entity.metadata.annotations?.[DEPLOY_HISTORY_ANNOTATION]),
    loader: () =>
      import('./components/DeployHistory').then(m => <m.DeployHistory />),
  },
});

export const deploysPlugin = createFrontendPlugin({
  pluginId: 'deploys',
  extensions: [deploysApi, deploysEntityContent],
});
