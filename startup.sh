#!/bin/bash
set -e

echo "Starting EventHorizon deployment..."

# Check if eventhorizon.local is in hosts file
if ! grep -q "eventhorizon.local" /etc/hosts; then
  echo "Adding eventhorizon.local to /etc/hosts..."
  echo "127.0.0.1 eventhorizon.local" | sudo tee -a /etc/hosts
fi

# Verify necessary files exist
if [ ! -f backend/src/main.ts ] || [ ! -f backend/src/app.module.ts ]; then
  echo "Error: Missing backend source files!"
  echo "Please run setup.sh first to create the necessary project structure."
  exit 1
fi

if [ ! -f frontend/src/pages/_app.tsx ] || [ ! -f frontend/src/pages/index.tsx ]; then
  echo "Error: Missing frontend source files!"
  echo "Please run setup.sh first to create the necessary project structure."
  exit 1
fi

if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
  echo "Error: Missing SSL certificates!"
  echo "Please run setup.sh first to generate SSL certificates."
  exit 1
fi

# Start containers
echo "Starting Docker containers..."
docker compose up -d

echo "EventHorizon is now running at https://eventhorizon.local"
echo "Note: You may need to accept the self-signed certificate in your browser."
