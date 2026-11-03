# deploys

Adds a Deploys tab to entity pages, showing data from the
[deploys backend plugin](../deploys-backend). It has stat tiles for deploys,
time from push to live, failed runs, and the last deploy, and a chart of runs per
week.

The tab appears on entities that name their history file:

```yaml
metadata:
  annotations:
    fossier.studio/deploy-history: bramble-server
```

The plugin is picked up by the app's package discovery. It also exports
`deploysApiRef`, which the home page uses for its deploy figures:

```ts
import { deploysApiRef } from '@internal/backstage-plugin-deploys';

const summary = await useApi(deploysApiRef).getHistory('bramble-server');
```
