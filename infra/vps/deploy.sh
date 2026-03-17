#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env.vps ]; then
  echo ".env.vps non trovato. Copia .env.vps.example in .env.vps e compila i valori."
  exit 1
fi

docker compose -f docker-compose.vps.yml up -d --build

echo "Deploy completato."
echo "Verifica: https://bittax.it"
