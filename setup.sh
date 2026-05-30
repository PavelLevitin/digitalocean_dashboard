#!/bin/bash
# setup.sh — one-shot server setup for pavellevitin.co.il dashboard
# Run as root on the DigitalOcean droplet.
# Usage: sudo bash setup.sh /home/pavel/digitaOcean

set -e

PROJECT_DIR="${1:-/home/pavel/digitaOcean}"
DOMAIN="pavellevitin.co.il"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "==> Installing Nginx, Certbot..."
apt update -q
apt install -y nginx certbot python3-certbot-nginx

echo ""
echo "==> IMPORTANT: Port 80 conflict"
echo "    If one of your existing PM2 apps listens on port 80,"
echo "    update its port to 8080, then run:  pm2 restart <app-name>"
echo "    Press Enter when done (or Ctrl+C to abort)."
read -r

echo "==> Disabling default Nginx site..."
rm -f /etc/nginx/sites-enabled/default

echo "==> Setting up temporary HTTP block for Certbot..."
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root /var/www/html;
}
EOF
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/"$DOMAIN"
nginx -t && systemctl reload nginx

echo "==> Obtaining Let's Encrypt certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect

echo "==> Installing final Nginx config with SSL..."
cp "$PROJECT_DIR/nginx.conf" "$NGINX_CONF"
nginx -t && systemctl reload nginx

echo "==> Installing Node.js dependencies..."
cd "$PROJECT_DIR"
npm install

echo ""
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "==> Creating .env — SET YOUR ADMIN_PASSWORD NOW:"
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  nano "$PROJECT_DIR/.env"
fi

echo "==> Building Next.js app..."
npm run build

echo "==> Starting dashboard with PM2..."
pm2 start npm --name dashboard -- start
pm2 save

echo ""
echo "==> Done. Verify:"
echo "    pm2 list"
echo "    curl http://localhost:3001"
echo "    nginx -t"
echo "    Visit https://$DOMAIN"
