#!/bin/bash

set -e

PI_HOST="${PI_HOST:-pi@berendswennenhuis.nl}"
PI_DIR="${PI_DIR:-/home/pi/berendswennenhuis.nl/stuur-berend-een-tekening}"

echo "Building for ARM64..."
docker buildx build --platform linux/arm64 -t stuur-berend-een-tekening:latest --load .

echo "Saving image..."
docker save stuur-berend-een-tekening:latest | gzip > stuur-berend-een-tekening.tar.gz

echo "Copying to Pi ($PI_HOST)..."
scp stuur-berend-een-tekening.tar.gz "$PI_HOST:$PI_DIR/"

echo "Loading image on Pi..."
ssh "$PI_HOST" "cd $PI_DIR && COMPOSE_HTTP_TIMEOUT=200 docker-compose down && gunzip -c stuur-berend-een-tekening.tar.gz | docker load && docker system prune -f && COMPOSE_HTTP_TIMEOUT=200 docker-compose up -d && rm stuur-berend-een-tekening.tar.gz"

echo "Cleaning up local file..."
rm stuur-berend-een-tekening.tar.gz

echo "Done!"
