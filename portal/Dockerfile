# Multi-stage build, so the image builds on any machine with Docker and needs
# no Node toolchain on the host. Run from this directory:
#
#   docker build -t fossier-portal:latest .

FROM node:24-trixie-slim AS build

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 g++ make libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /app
COPY --chown=node:node . .

RUN yarn install --immutable
RUN yarn tsc
RUN yarn build:backend

FROM node:24-trixie-slim

# python3-venv and mkdocs-techdocs-core let TechDocs build docs inside the
# container. The compilers are for native modules in the production install.
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv g++ make libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/mkdocs && \
    /opt/mkdocs/bin/pip install --no-cache-dir mkdocs-techdocs-core==1.7.1
ENV PATH=/opt/mkdocs/bin:$PATH

USER node
WORKDIR /app
ENV NODE_ENV=production

COPY --chown=node:node .yarn ./.yarn
COPY --chown=node:node .yarnrc.yml backstage.json yarn.lock package.json ./
COPY --from=build --chown=node:node /app/packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN yarn workspaces focus --all --production && rm -rf "$(yarn cache clean)"

COPY --from=build --chown=node:node /app/packages/backend/dist/bundle.tar.gz ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

COPY --chown=node:node app-config*.yaml ./
COPY --chown=node:node catalog ./catalog
RUN mkdir -p /app/techdocs

CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
