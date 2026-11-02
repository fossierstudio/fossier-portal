#!/bin/sh
# Sends the portal source to the host and builds the image there, so the build
# needs no disk or Docker on this machine. The last image is kept as
# fossier-portal:previous. To roll back, set PORTAL_TAG=previous in the host's
# .env and run docker compose up -d.
#
#   deploy/deploy.sh <ssh-host>
set -eu

host=$1
dir=${DEPLOY_DIR:-/opt/backstage-demo}
root=$(dirname "$0")/..

# Tracked and new files, without anything .gitignore excludes.
git -C "$root" ls-files -co --exclude-standard -- portal |
  tar -C "$root" -cf - -T - |
  ssh "$host" "rm -rf '$dir/src' && mkdir -p '$dir/src' && tar -C '$dir/src' -xf -"
ssh "$host" "docker image inspect fossier-portal:latest >/dev/null 2>&1 &&
  docker tag fossier-portal:latest fossier-portal:previous;
  docker build -t fossier-portal:latest '$dir/src/portal'"
scp -q "$root/deploy/docker-compose.yml" "$host:$dir/docker-compose.yml"
ssh "$host" "cd '$dir' && docker compose up -d --wait"
