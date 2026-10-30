# Decision log

## Run the portal beside k3s, not inside it

The host's k3s cluster runs the Canopy dev environment. Adding the portal to it
would put a shared API server and shared resources at risk for a tool that
doesn't need them yet.

The portal runs as its own Compose project with memory and CPU limits instead.
It can be stopped, rebuilt, or removed without touching that cluster.

## Build the image off the host

The host also runs CI builds, and they can saturate its disk. Building Backstage
there would compete with that work, so the image is built elsewhere and shipped
to the host. The Dockerfile is multi-stage, so any machine with Docker can
produce the same image.

## Keep catalog data in this repo

Backstage usually reads a `catalog-info.yaml` from each service's repo. Several
of these repos are private, and this one is public, so catalog entries live here
and link to public pages. Without access to those repos, the portal needs no
GitHub token, which also means there is no credential to protect.

The cost is that an entry can drift from its repo. Moving entries into each repo
comes with live CI status, which needs a token anyway.

## Run TechDocs inside the container

The default TechDocs setup starts a Docker container for each build, which would
mean giving the portal the host's Docker socket and, with it, control of the
host. Installing `mkdocs-techdocs-core` in the image avoids that.

## Keep the portal open and read-only

The portal exists to be looked at, and a sign-in wall would stop most visitors at
the door, so anyone can enter as a guest. That only works if a guest can't change
anything, and hiding pages doesn't do that: an early version turned off the
create and import pages, but a guest token could still call the scaffolder API.

Enforcement now lives in the backend. The scaffolder, notifications, user
settings, and MCP plugins aren't installed, and a permission policy denies every
user action except reading. Real sign-in comes back with self-service templates,
which need it.

## Publish through a tunnel, with no route out

The host sits on a home network, so opening ports would expose its address and
leave a public service next to private ones. A Cloudflare Tunnel makes an outbound
connection instead, and Cloudflare provides HTTPS.

The tunnel runs as its own container with its own token, so it can't affect the
host's other tunnel, and stopping it takes the portal offline at once. The portal
and Postgres sit on an internal Docker network with no published ports. If the
portal were compromised, it would have no way to reach the LAN, the k3s cluster,
or the internet. The cost is that anything needing outbound access, such as live
CI status, will need a deliberate exception.
