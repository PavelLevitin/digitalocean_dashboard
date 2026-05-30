#!/bin/bash
# setup.sh — one-shot server setup for pavellevitin.co.il dashboard
# Run as root (or with sudo) on the DigitalOcean droplet.
# Usage: bash setup.sh /path/to/dashboard/project

set -e

PROJECT_DIR="${1:-/var/www/dashboard}"
DOMAIN="pavellevitin.co.il"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "==> Installing Nginx, Certbot..."
apt update -q
apt install -y nginx certbot python3-certbot-nginx

echo ""
echo "==> IMPORTANT: Port 80 conflict"
echo "    If one of your existing PM2 apps is listening on port 80,"
echo "    you must change it to an internal port (e.g. 8080) first."
echo "    Update its config/env, then run:  pm2 restart <app-name>"
echo "    Press Enter when done (or Ctrl+C to abort)."
read -r

echo "==> Stopping default Nginx site..."
rm -f /etc/nginx/sites-enabled/default

echo "==> Copying Nginx config..."
cp "$PROJECT_DIR/nginx.conf" "$NGINX_CONF"

echo "==> Testing temporary HTTP-only config for Certbot..."
# Temporarily use a plain HTTP block so certbot can reach .well-known
cat > /etc/nginx/sites-enabled/"$DOMAIN" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root /var/www/html;
}
EOF
nginx -t
systemctl reload nginx

echo "==> Obtaining Let's Encrypt certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN" --redirect

echo "==> Installing final Nginx config with SSL..."
cp "$PROJECT_DIR/nginx.conf" "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/"$DOMAIN"
nginx -t
systemctl reload nginx

echo "==> Installing Node.js dependencies..."
cd "$PROJECT_DIR"
npm install --production

echo ""
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "==> Creating .env — SET YOUR ADMIN_PASSWORD NOW:"
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  echo "    Edit $PROJECT_DIR/.env and set ADMIN_PASSWORD, then press Enter."
  read -r
fi

echo "==> Starting dashboard with PM2..."
pm2 start "$PROJECT_DIR/server.js" --name dashboard
pm2 save

echo ""
echo "==> Done. Verify:"
echo "    pm2 list"
echo "    curl http://localhost:3001"
echo "    nginx -t"
echo "    Visit https://$DOMAIN in your browser"
