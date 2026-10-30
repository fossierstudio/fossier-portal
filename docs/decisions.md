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

## Polyfill `crypto.randomUUID`

Browsers only expose `crypto.randomUUID` on HTTPS or localhost, and Backstage
calls it while rendering the sidebar. The portal is served over plain HTTP on a
private network, so the sidebar crashed. A small polyfill built on
`crypto.getRandomValues` fixes that without adding a certificate to a private
service. Serving the portal over HTTPS would make it unnecessary.

## Run TechDocs inside the container

The default TechDocs setup starts a Docker container for each build, which would
mean giving the portal the host's Docker socket and, with it, control of the
host. Installing `mkdocs-techdocs-core` in the image avoids that.

## Keep the portal read-only for now

The scaffolder, catalog import, and notifications pages are turned off. Nothing
on the portal can change anything yet, which suits a showcase signed in as a
guest. They come back when self-service templates and real sign-in do.
