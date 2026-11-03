#!/bin/sh
# Copies the deploys plugin's history from main into the folder the portal reads
# it from, so new runs show up without rebuilding the image. The portal has no
# internet access, so the host fetches the files and the portal reads them from
# a read-only mount. deploy.sh installs this to run every 15 minutes.
#
#   sync-deploys.sh <dir>
set -eu

dir=$1
repo=fossierstudio/fossier-portal
path=portal/catalog/deploys

mkdir -p "$dir"
# Next to the folder, so each file is replaced in one rename.
tmp=$(mktemp -d "$(dirname "$dir")/.sync-deploys.XXXXXX")
trap 'rm -rf "$tmp"' EXIT

curl -fsS "https://api.github.com/repos/$repo/contents/$path?ref=main" \
  -o "$tmp/listing.json"
jq -r '.[] | select(.type == "file" and (.name | test("^[a-z0-9][a-z0-9-]*\\.json$"))) | .name' \
  "$tmp/listing.json" |
  while read -r name; do
    curl -fsS "https://raw.githubusercontent.com/$repo/main/$path/$name" \
      -o "$tmp/$name"
    # A broken file would only fail that one tab, but keep the last good copy.
    if ! jq -e '.runs | type == "array"' "$tmp/$name" >/dev/null; then
      echo "Skipping $name: not a deploy history" >&2
      continue
    fi
    if ! cmp -s "$tmp/$name" "$dir/$name"; then
      # The portal runs as an unprivileged user, so the file must be readable.
      chmod 644 "$tmp/$name"
      mv "$tmp/$name" "$dir/$name"
      echo "Updated $name"
    fi
  done
