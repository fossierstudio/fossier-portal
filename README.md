# Fossier Studio Portal

A [Backstage](https://backstage.io/) developer portal for the products I build
and run at [Fossier Studio](https://fossier.studio/projects/). It puts every
system, its components, its owner, and its docs in one place.

I built this solo over a weekend to bring my four products into one catalog and
to get hands-on with Backstage by running it for real.

**Live at [portal.fossier.studio](https://portal.fossier.studio/).** No sign-in
needed. It runs on a home server, so it may occasionally be offline.

![The portal home page, showing a map of four systems and their components](docs/images/home.png)

## What's in the catalog

| System | What it is | Where it runs |
|---|---|---|
| **Mycel** | GitHub Actions monitoring with on-device AI failure analysis | Mac, iOS, and Android apps, plus a Cloudflare Worker |
| **Bramble** | Community platform with real-time chat, voice, and video | Hetzner, with blue/green deploys behind nginx |
| **Canopy** | Staff scheduling for small counseling practices | Next.js and Expo, with Supabase on k3s |
| **MetaMatching** | Three-player experiment platform for a PhD dissertation | Node.js under hardened systemd |

Bramble has shipped 480 production deploys since March 2026, with a median of 6
minutes from push to live. The [engineering page](https://fossier.studio/engineering/)
covers how these systems are built and operated.

## What this project shows

- **Software catalog as code.** Systems, components, resources, owners, and
  dependencies are YAML in [`portal/catalog`](portal/catalog), reviewed like any
  other change.
- **Docs next to the catalog.** Each system has TechDocs, built by Backstage
  inside the container, with no separate docs pipeline.
- **APIs in the catalog.** Bramble's REST API (OpenAPI, 152 operations) and its
  WebSocket gateway (AsyncAPI) are API entities, linked to the server that
  provides them and the clients that use them. The REST spec is generated from
  the server's own route schemas rather than written by hand.
- **A custom frontend.** The home page is a React page in Backstage's new
  frontend system that draws the system map from the catalog API, so it follows
  the catalog as entries change. The theme matches the studio's site.
- **Repeatable deployment.** A multi-stage Dockerfile, a Docker Compose stack
  with memory and CPU limits, and a [deploy script](deploy/deploy.sh) that keeps
  the previous image for rollback.
- **CI on every change.** [GitHub Actions](.github/workflows/ci.yml) runs lint and
  tests, builds the production image, and validates the Compose file.

| Catalog | System page | Docs | API |
|---|---|---|---|
| ![Catalog table](docs/images/catalog.png) | ![Bramble system page](docs/images/system.png) | ![Bramble docs](docs/images/docs.png) | ![Bramble REST API](docs/images/api.png) |

## How it fits together

```mermaid
flowchart LR
    browser[Browser] -->|HTTPS| cloudflare[Cloudflare]
    cloudflare --> tunnel
    subgraph host[Linux host]
        subgraph stack[backstage-demo Compose project]
            tunnel[Tunnel container]
            portal[Backstage<br/>frontend and backend]
            postgres[(Postgres)]
            techdocs[(TechDocs volume)]
        end
    end
    catalog[portal/catalog<br/>YAML and Markdown] -->|built into image| portal
    tunnel --> portal
    portal --> postgres
    portal --> techdocs
```

The portal shares a host with other workloads, including a k3s cluster. It runs
separately from that cluster, so a change here can't affect them, and it reaches
the internet only through its own Cloudflare Tunnel. The reasons behind this and
other choices are in the [decision log](docs/decisions.md).

## Run it

Build the image from `portal/`:

```bash
docker build -t fossier-portal:latest portal
```

Create a Cloudflare Tunnel that points your hostname at `http://portal:7007`.
Copy `deploy/.env.example` to `deploy/.env`, then set the public URL, a password,
and the tunnel token. Start the stack from `deploy/`:

```bash
docker compose up -d
```

To update a running host, send the source and build the image there with:

```bash
deploy/deploy.sh <ssh-host>
```

## Security

- **Open and read-only.** Visitors go straight in as guests. A
  [permission policy](portal/packages/backend/src/readOnlyPolicy.ts) denies every
  user action except reading, so the rule holds at the API as well as in the
  interface. The scaffolder and other plugins that act on outside systems aren't
  installed.
- **No way in except the tunnel.** The host publishes no ports for this stack,
  and its home network address stays hidden behind Cloudflare.
- **No way out.** The portal and Postgres sit on a private Docker network with no
  route to the host, its LAN, the k3s cluster, or the internet.
- Secrets live in `deploy/.env`, which is gitignored.
- This public repo leaves out paths to private source repos, and the portal shows
  nothing that isn't already in it.

## What's next

1. Live CI and Kubernetes status on each catalog page.
2. Self-service templates that create a new service with CI, docs, and a
   runbook, with real sign-in for anyone who can use them.
3. GitOps deployment with Argo CD.
4. AWS infrastructure in Terraform.
