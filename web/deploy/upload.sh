#!/bin/bash
# ============================================================
# UPLOAD — Envoie les fichiers du projet vers le VPS
# Usage : bash upload.sh <IP_DU_SERVEUR>
# Exemple : bash upload.sh 185.185.185.1
# ============================================================

SERVER_IP="${1:?Fournissez l'IP du serveur: bash upload.sh <IP>}"
SERVER_USER="root"
APP_DIR="/var/www/comparetabanque"

echo "=== Upload vers $SERVER_USER@$SERVER_IP:$APP_DIR ==="

# Sync tous les fichiers sauf node_modules, .next et .env.local
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'deploy' \
  --exclude '*.log' \
  "$(dirname "$0")/../" \
  "$SERVER_USER@$SERVER_IP:$APP_DIR/"

echo ""
echo "=== Copie du fichier .env.production ==="
scp "$(dirname "$0")/../.env.production" "$SERVER_USER@$SERVER_IP:$APP_DIR/.env.local"

echo ""
echo "✅ Upload terminé. Connectez-vous et lancez : bash deploy.sh"
echo "   ssh root@$SERVER_IP"
echo "   cd $APP_DIR && bash deploy/deploy.sh"
