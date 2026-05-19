#!/usr/bin/env bash
# =============================================================================
#  Matematyka 4 — skrypt aktualizacji (uruchamiany po każdym push do main)
#
#  Użycie:
#    ssh root@srv65.mikr.us -p 10201 "bash /opt/math4/deploy/update.sh"
# =============================================================================

set -euo pipefail

APP_DIR="/opt/math4"

if [[ $EUID -ne 0 ]]; then
  echo "ERROR: skrypt musi być uruchomiony jako root."
  exit 1
fi

echo "▶ Pobieranie zmian z repozytorium..."
git -C "$APP_DIR" fetch origin
git -C "$APP_DIR" reset --hard origin/main

echo "▶ Build backendu..."
cd "$APP_DIR/backend"
npm install --silent
npm run build 2>&1 | tail -3

echo "▶ Migracje bazy danych..."
source "$APP_DIR/.env" 2>/dev/null || true
DATABASE_URL="$(grep DATABASE_URL "$APP_DIR/.env" | cut -d= -f2- | tr -d '"')" \
  npx prisma migrate deploy

echo "▶ Build frontendu..."
cd "$APP_DIR/frontend"
npm install --silent
npm run build 2>&1 | tail -3

echo "▶ Restart serwisu..."
systemctl restart math4-backend

echo -n "  Czekam na backend"
for i in $(seq 1 15); do
  sleep 1; echo -n "."
  curl -sf http://localhost:3001/health >/dev/null 2>&1 && echo " OK" && break
  [[ $i -eq 15 ]] && echo " TIMEOUT" && journalctl -u math4-backend -n 10 && exit 1
done

echo ""
echo "✓ Aktualizacja zakończona pomyślnie."
echo "  math4-backend: $(systemctl is-active math4-backend)"
