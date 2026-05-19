#!/usr/bin/env bash
# =============================================================================
#  Matematyka 4 — jednorazowy skrypt setup (Mikrus / Debian)
#
#  Uruchomienie (po sklonowaniu repo lub przesłaniu rsync):
#    bash /opt/math4/deploy/setup.sh
#
#  Lub z klonowaniem z GitHuba:
#    bash setup.sh https://github.com/TWÓJ_USER/TWOJE_REPO.git
#
#  Co robi skrypt:
#    1. Instaluje Node.js 18, PostgreSQL, nginx, git
#    2. Klonuje repo do /opt/math4 (jeśli nie istnieje)
#    3. Tworzy bazę danych PostgreSQL i użytkownika
#    4. Pyta o JWT_SECRET i zapisuje /opt/math4/.env
#    5. Buduje backend (npm run build)
#    6. Uruchamia migracje Prisma
#    7. Buduje frontend (npm run build)
#    8. Konfiguruje systemd + nginx
# =============================================================================

set -euo pipefail

REPO_URL="${1:-}"
APP_DIR="/opt/math4"
DEPLOY_DIR="$APP_DIR/deploy"
DB_USER="math4"
DB_NAME="math4"
BACKEND_PORT=3001

if [[ $EUID -ne 0 ]]; then
  echo "ERROR: skrypt musi być uruchomiony jako root."
  exit 1
fi

echo ""
echo "══════════════════════════════════════════════════"
echo "  Matematyka 4 — setup serwera"
echo "══════════════════════════════════════════════════"
echo ""

# ── 1. Paczki systemowe ───────────────────────────────────────────────────────
echo "▶ [1/8] Instalacja paczek systemowych..."
apt-get update -qq
apt-get install -y -qq curl git nginx postgresql

# Node.js 18 (jeśli brak lub stary)
NODE_OK=false
if command -v node &>/dev/null; then
  NODE_VER=$(node -e "process.exit(+process.version.slice(1).split('.')[0] < 18 ? 1 : 0)" 2>/dev/null && echo ok || echo old)
  [[ "$NODE_VER" == "ok" ]] && NODE_OK=true
fi
if [[ "$NODE_OK" == "false" ]]; then
  echo "  Instalacja Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
fi

echo "  Node: $(node --version)  |  npm: $(npm --version)"

# ── 2. Kod źródłowy ───────────────────────────────────────────────────────────
echo "▶ [2/8] Kod źródłowy..."
if [[ -d "$APP_DIR/backend" ]]; then
  echo "  Kod już jest w $APP_DIR — pomijam klonowanie."
elif [[ -n "$REPO_URL" ]]; then
  echo "  Klonowanie z $REPO_URL..."
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "ERROR: $APP_DIR nie istnieje i nie podano URL repozytorium."
  echo "  Prześlij pliki przez rsync, a potem uruchom: bash $DEPLOY_DIR/setup.sh"
  exit 1
fi

# ── 3. Baza danych PostgreSQL ─────────────────────────────────────────────────
echo "▶ [3/8] Konfiguracja PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Generuj losowe hasło do bazy
DB_PASS=$(openssl rand -hex 24)

# Utwórz użytkownika i bazę (ignoruj błąd jeśli już istnieją)
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || \
  sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
echo "  Baza gotowa: $DATABASE_URL"

# ── 4. Plik .env ──────────────────────────────────────────────────────────────
echo "▶ [4/8] Tworzenie pliku .env..."

# JWT_SECRET — wygeneruj losowy jeśli nie podany
JWT_SECRET=$(openssl rand -hex 32)

cat > "$APP_DIR/.env" <<EOF
DATABASE_URL="${DATABASE_URL}"
JWT_SECRET="${JWT_SECRET}"
PORT=${BACKEND_PORT}
CORS_ORIGIN="https://pbes.tojest.dev"
EOF

echo "  Zapisano $APP_DIR/.env"
echo "  JWT_SECRET: ${JWT_SECRET:0:8}... (wygenerowany losowo)"

# ── 5. Build backendu ─────────────────────────────────────────────────────────
echo "▶ [5/8] Build backendu..."
cd "$APP_DIR/backend"
npm install --silent
npm run build 2>&1 | tail -3

# ── 6. Migracje Prisma ────────────────────────────────────────────────────────
echo "▶ [6/8] Migracje bazy danych..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

# ── 7. Build frontendu ────────────────────────────────────────────────────────
echo "▶ [7/8] Build frontendu..."
cd "$APP_DIR/frontend"
npm install --silent
npm run build 2>&1 | tail -3
echo "  dist/ rozmiar: $(du -sh dist/ | cut -f1)"

# ── 8. systemd + nginx ────────────────────────────────────────────────────────
echo "▶ [8/8] Konfiguracja systemd i nginx..."

# Serwis systemd
cp "$DEPLOY_DIR/math4-backend.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable math4-backend
systemctl restart math4-backend

# Czekaj na start backendu
echo -n "  Czekam na backend"
for i in $(seq 1 20); do
  sleep 1; echo -n "."
  if curl -sf "http://localhost:${BACKEND_PORT}/health" >/dev/null 2>&1; then
    echo " OK"
    break
  fi
  if [[ $i -eq 20 ]]; then
    echo " TIMEOUT"
    journalctl -u math4-backend --no-pager -n 20
    exit 1
  fi
done

# nginx — dodaj location bloki do istniejącej konfiguracji ams-cloud (jeśli istnieje)
NGINX_CONF="/etc/nginx/sites-available/ams-cloud"
if [[ -f "$NGINX_CONF" ]] && ! grep -q "math4" "$NGINX_CONF"; then
  echo "  Dodaję location bloki /math4/ do istniejącej konfiguracji nginx..."
  # Wstaw location bloki przed ostatnią } w pliku
  sed -i "s|^}$|    # === Matematyka 4 ===\n    location /math4/api/ {\n        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;\n        proxy_set_header Host \$host;\n        proxy_set_header X-Real-IP \$remote_addr;\n        proxy_set_header X-Forwarded-Proto \$scheme;\n        proxy_buffer_size 16k;\n        proxy_buffers 4 16k;\n    }\n\n    location /math4/ {\n        alias ${APP_DIR}/frontend/dist/;\n        try_files \$uri \$uri/ /math4/index.html;\n    }\n}|" "$NGINX_CONF"
elif [[ ! -f "$NGINX_CONF" ]]; then
  echo "  Brak konfiguracji ams-cloud — tworzę nową konfigurację nginx..."
  cat > /etc/nginx/sites-available/math4 <<NGINXEOF
server {
    listen 80;
    listen [::]:80;
    server_name pbes.tojest.dev;

    location /math4/api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffer_size 16k;
        proxy_buffers 4 16k;
    }

    location /math4/ {
        alias ${APP_DIR}/frontend/dist/;
        try_files \$uri \$uri/ /math4/index.html;
    }
}
NGINXEOF
  ln -sf /etc/nginx/sites-available/math4 /etc/nginx/sites-enabled/math4
else
  echo "  Konfiguracja nginx już zawiera /math4/ — pomijam."
fi

nginx -t
systemctl enable nginx
systemctl reload nginx

# ── Podsumowanie ──────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════"
echo "  Matematyka 4 — setup zakończony pomyślnie!"
echo "══════════════════════════════════════════════════"
echo ""
echo "  URL: http://pbes.tojest.dev/math4/"
echo "  API: http://pbes.tojest.dev/math4/api/v1/health"
echo ""
echo "  Przydatne komendy:"
echo "  systemctl status math4-backend"
echo "  journalctl -fu math4-backend"
echo "  bash $DEPLOY_DIR/update.sh"
echo "══════════════════════════════════════════════════"
