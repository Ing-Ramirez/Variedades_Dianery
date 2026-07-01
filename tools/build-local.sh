#!/usr/bin/env bash
# ============================================================
# Build de PRODUCCIÓN local → dist/  (idéntico al del deploy).
#
# Precompila los .jsx a .js y reescribe los HTML (sin Babel), igual que
# .github/workflows/deploy.yml. Sirve para verificar localmente lo MISMO
# que se sube a Hostinger ("dev = prod") antes de desplegar.
#
#   bash tools/build-local.sh
#   docker compose -f docker-compose.prod.yml up -d   ->  http://localhost:8081
#   docker compose -f docker-compose.prod.yml down
#
# Requiere node (para @babel/standalone). No afecta el entorno de dev (8080).
# ============================================================
set -e
cd "$(dirname "$0")/.."   # raíz del repo

OUT=dist
rm -rf "$OUT"
mkdir -p "$OUT/admin" "$OUT/components" "$OUT/uploads"

# 1) Copia los archivos publicables (mismo set que el deploy).
cp index.html index.php og-image.php sitemap.php robots.txt app.jsx config.js \
   dianery-data.js footer.css styles.css tweaks-panel.jsx favicon.svg api.php db.php hit.php "$OUT/"
cp -r admin/. "$OUT/admin/"
cp -r components/. "$OUT/components/"
[ -d uploads ] && cp -r uploads/. "$OUT/uploads/" || true
cp .htaccess "$OUT/" 2>/dev/null || true

# 2) Datos y token LOCALES para que la preview muestre productos y el admin
#    autentique. NO se versionan ni se despliegan (gitignored). Solo preview.
[ -f data.json ] && cp data.json "$OUT/" || true
[ -f .dianery-admin-token.php ] && cp .dianery-admin-token.php "$OUT/" || true

# 3) Cache-busting: __VER__ → SHA corto (o "local" si no hay git).
VER="$(git rev-parse --short=8 HEAD 2>/dev/null || echo local)"
sed -i "s/__VER__/$VER/g" "$OUT/index.html" "$OUT/admin/Admin.html"

# 4) Precompila JSX → JS con el MISMO Babel del CDN dev (paridad).
npm i @babel/standalone@7.29.0 --no-save --no-audit --no-fund
node tools/precompile.js "$OUT"

# 5) Reescribe los HTML: quita Babel y cambia .jsx → .js.
sed -i \
  -e '/babel\/standalone/d' \
  -e 's#type="text/babel" src="\([^"]*\)\.jsx\([^"]*\)"#src="\1.js\2"#g' \
  "$OUT/index.html" "$OUT/admin/Admin.html"

echo ""
echo "✅ Build de producción en $OUT/  (versión $VER)"
echo "   Previsualiza:  docker compose -f docker-compose.prod.yml up -d  ->  http://localhost:8081"
echo "                  (admin en  http://localhost:8081/admin/Admin.html )"
