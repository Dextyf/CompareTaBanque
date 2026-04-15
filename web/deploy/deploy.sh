#!/bin/bash
# ============================================================
# DÉPLOIEMENT — CompareTaBanque
# À exécuter sur le VPS depuis /var/www/comparetabanque
# Usage : bash deploy.sh
# ============================================================
set -e

APP_DIR="/var/www/comparetabanque"
APP_NAME="comparetabanque"

echo "=== [1/5] Copie des fichiers ==="
# (les fichiers sont déjà copiés via rsync/sftp avant ce script)
cd "$APP_DIR"

echo "=== [2/5] Installation des dépendances ==="
npm ci --only=production=false

echo "=== [3/5] Build production ==="
npm run build

echo "=== [4/5] Démarrage / Redémarrage PM2 ==="
if pm2 list | grep -q "$APP_NAME"; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save

echo "=== [5/5] Reload Nginx ==="
nginx -t && systemctl reload nginx

echo ""
echo "✅ Déploiement terminé. App disponible sur http://$(curl -s ifconfig.me):3000"
pm2 status
