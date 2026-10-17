#!/usr/bin/env bash
# フロントをビルドして Spring Boot の jar に含める（画面とAPIを1つの jar で配信する）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATIC_DIR="$ROOT/backend/src/main/resources/static"

cd "$ROOT/frontend"
npm ci
npm run build

rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"
cp -R dist/. "$STATIC_DIR/"

cd "$ROOT/backend"
./gradlew bootJar

ls -l build/libs/*.jar
