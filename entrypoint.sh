#!/bin/bash
set -e

echo "======================================"
echo "  Austify Container Starting Up..."
echo "======================================"

# --- 1. Generate app key if not set ---
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    echo "[setup] Generating APP_KEY..."
    php artisan key:generate --force
fi

# --- 2. Clear cached config so fresh env is used ---
php artisan config:clear
php artisan cache:clear

# --- 3. Wait for PostgreSQL to be ready ---
echo "[db] Waiting for PostgreSQL to accept connections..."
MAX_TRIES=30
TRIES=0
until php artisan tinker --execute="DB::connection()->getPdo();" > /dev/null 2>&1; do
    TRIES=$((TRIES + 1))
    if [ $TRIES -ge $MAX_TRIES ]; then
        echo "[db] ERROR: PostgreSQL did not become ready in time. Check your DB config."
        exit 1
    fi
    echo "[db] PostgreSQL not ready yet (attempt $TRIES/$MAX_TRIES). Waiting 5s..."
    sleep 5
done
echo "[db] PostgreSQL is ready!"

# --- 4. Run migrations ---
echo "[migrate] Running migrations..."
php artisan migrate --force
echo "[migrate] Done."

# --- 5. Seed admin user ---
echo "[seed] Seeding admin user..."
php artisan db:seed --class=AdminSeeder --force
echo "[seed] Done."

# --- 6. Cache config for production ---
php artisan config:cache
php artisan route:cache
php artisan view:cache

# --- 7. Ensure storage link exists ---
echo "[storage] Linking storage..."
php artisan storage:link --force 2>/dev/null || true

# --- 8. Set correct permissions ---
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "======================================"
echo "  Setup complete! Starting Apache..."
echo "======================================"

# --- 9. Start Apache in foreground ---
exec apache2-foreground