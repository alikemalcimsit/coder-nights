#!/bin/bash
HOST="interchange.proxy.rlwy.net"
PORT="13124"
USER="root"
PASS="FAlpqQWfFReeFtrRCdcdADwLSDIZRidI"
DB="railway"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Migration çalıştırılıyor..."
mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASS" --protocol=TCP "$DB" < "$DIR/migration.sql"
echo "Migration tamam!"

echo "Seed çalıştırılıyor..."
mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASS" --protocol=TCP "$DB" < "$DIR/seed.sql"
echo "Seed tamam!"
