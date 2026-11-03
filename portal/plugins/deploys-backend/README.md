# deploys-backend

Serves deploy history for the [deploys frontend plugin](../deploys).

`GET /api/deploys/history/:name` reads `<dataDir>/<name>.json`, written by
[`scripts/export-deploys.mjs`](../../../scripts/export-deploys.mjs), and returns:

| Field                         | Meaning                                                |
| ----------------------------- | ------------------------------------------------------ |
| `target`                      | Where successful runs deploy to                        |
| `deploys`                     | Successful runs                                        |
| `medianMinutes`, `p90Minutes` | Time from push to live, over successful runs           |
| `failedRuns`, `failureRate`   | Failed runs, and their share of runs that finished     |
| `cancelledRuns`               | Runs cancelled before finishing                        |
| `firstDeploy`, `lastDeploy`   | First and last successful runs                         |
| `weeks`                       | Deploys and failed runs per week, starting each Monday |

Names are limited to lowercase letters, digits, and hyphens, so a request can't
read other files. Requests need a signed-in user or guest, like the rest of the
portal's API.

## Setup

```ts
// packages/backend/src/index.ts
backend.add(import('@internal/backstage-plugin-deploys-backend'));
```

```yaml
# app-config.yaml, relative to the backend's working directory
deploys:
  dataDir: ../../catalog/deploys
```
