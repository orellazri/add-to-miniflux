#!/usr/bin/env bash

set -euo pipefail

BROWSER="${1:-}"

if [[ -z "$BROWSER" ]]; then
  printf 'Usage: release-extension.sh <chrome|firefox>\n'
  exit 1
fi

if [[ "$BROWSER" != "chrome" && "$BROWSER" != "firefox" ]]; then
  printf 'Error: Browser must be one of: chrome, firefox\n'
  exit 1
fi

MANIFEST="extension/${BROWSER}/manifest.json"
CURRENT_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')).version)" "$MANIFEST")
printf 'Current extension version: %s\n' "$CURRENT_VERSION"

printf 'Enter the new version (e.g. 1.0.1):\n'
read -r VERSION

if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  printf 'Error: Version must be in format X.Y.Z (e.g. 1.0.1)\n'
  exit 1
fi

node -e "const fs = require('fs'); const path = process.argv[1]; const version = process.argv[2]; const manifest = JSON.parse(fs.readFileSync(path, 'utf8')); manifest.version = version; fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');" "$MANIFEST" "$VERSION"

printf 'Updated %s to version %s\n' "$MANIFEST" "$VERSION"

mkdir -p dist
(cd "extension/$BROWSER" && zip -r "../../dist/add-to-miniflux-${BROWSER}-extension.zip" . -x '*.DS_Store' -x '__MACOSX/*')

printf 'Created dist/add-to-miniflux-%s-extension.zip\n' "$BROWSER"
