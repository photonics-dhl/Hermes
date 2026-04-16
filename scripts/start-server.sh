#!/bin/bash
# Scholar's Tea - Server Startup Script

set -e

echo "Starting Scholar's Tea services..."

# Start PostgreSQL
echo "Starting PostgreSQL..."
pg_ctl -D /data/home/zju321/pgdata -l /data/home/zju321/pgdata/logfile start

# Wait for PostgreSQL to be ready
sleep 2

echo "PostgreSQL is running."

# Check if app is installed
if [ ! -d "/data/home/zju321/Scholar-s_Tea/node_modules" ]; then
    echo "Installing dependencies..."
    cd /data/home/zju321/Scholar-s_Tea
    npm install
fi

echo "All services started."
echo ""
echo "To start the app:"
echo "  cd /data/home/zju321/Scholar-s_Tea && npm run dev"
