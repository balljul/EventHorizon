echo "127.0.0.1 eventhorizon.local" | sudo tee -a /etc/hosts

docker compose up -d

echo "EventHorizon is now running at https://eventhorizon.local"

