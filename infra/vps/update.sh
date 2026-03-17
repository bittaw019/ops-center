#!/usr/bin/env bash
set -euo pipefail

git pull --rebase

docker compose -f docker-compose.vps.yml up -d --build

echo "Update completato."
