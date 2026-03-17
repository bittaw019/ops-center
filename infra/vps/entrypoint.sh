#!/bin/sh
set -e

echo "[entrypoint] Prisma db push..."
npx prisma db push

echo "[entrypoint] Starting Next.js..."
exec npm run start
