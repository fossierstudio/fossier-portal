#!/bin/sh
# Builds the image here and ships it to the host, so the host's CI work isn't
# competing with a Backstage build. To roll back, set PORTAL_TAG=previous in the
# host's .env and run docker compose up -d.
#
#   deploy/deploy.sh <ssh-host>
set -eu

host=$1
dir=${DEPLOY_DIR:-/opt/backstage-demo}
root=$(dirname "$0")/..

docker build -t fossier-portal:latest "$root/portal"
ssh "$host" 'docker tag fossier-portal:latest fossier-portal:previous'
docker save fossier-portal:latest | gzip -1 | ssh "$host" 'gunzip | docker load'
scp -q "$root/deploy/docker-compose.yml" "$host:$dir/docker-compose.yml"
ssh "$host" "cd '$dir' && docker compose up -d --wait"
