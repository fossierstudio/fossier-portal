# Portal app

The Backstage app behind the Fossier Studio Portal. See the
[project README](../README.md) for the overview.

| Path                              | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `catalog/`                        | Catalog entities and TechDocs, one folder per system |
| `packages/app/src/modules/home/`  | Home page and system map                             |
| `packages/app/src/modules/theme/` | Theme and Backstage UI tokens                        |
| `packages/app/src/modules/nav/`   | Sidebar and wordmark                                 |
| `Dockerfile`                      | Multi-stage production image                         |

To run it locally:

```sh
yarn install
yarn start
```
