#!/bin/bash
# ============================================================
# SETUP SERVEUR — CompareTaBanque
# À exécuter UNE SEULE FOIS sur le VPS Hostinger (root)
# Usage : bash setup-server.sh
# ============================================================
set -e

echo "=== [1/6] Mise à jour système ==="
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

echo "=== [2/6] Installation Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version && npm --version

echo "=== [3/6] Installation PM2 ==="
npm install -g pm2
pm2 startup systemd -u root --hp /root

echo "=== [4/6] Configuration Firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=== [5/6] Dossier application ==="
mkdir -p /var/www/comparetabanque
chown -R root:root /var/www/comparetabanque

echo "=== [6/6] Configuration Nginx de base ==="
cat > /etc/nginx/sites-available/comparetabanque << 'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/comparetabanque /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo "✅ Serveur prêt. Lancez maintenant : bash deploy.sh"
