#!/bin/bash

set -e

MAX_RETRIES=3
RETRY_DELAY=5

cleanup_containers() {
    local port=$1
    echo "Cleaning up containers for port $port..."
    docker compose -p "port$port" down --volumes --remove-orphans 2>/dev/null || true
    rm -rf "/tmp/$port" "./$port" 2>/dev/null || true
}

start_environment() {
    local port=$1
    local config="./tests/playwright/.playwright-wp-lite-env.json"

    for attempt in $(seq 1 $MAX_RETRIES); do
        echo ""
        echo "=== Starting WordPress environment on port $port (attempt $attempt/$MAX_RETRIES) ==="

        if [ $attempt -gt 1 ]; then
            echo "Cleaning up before retry..."
            cleanup_containers "$port"
            sleep $RETRY_DELAY
        fi

        set +e
        npx wp-lite-env start --config="$config" --port="$port" 2>&1
        local exit_code=$?
        set -e

        if [ $exit_code -eq 0 ]; then
            echo "WordPress environment on port $port started successfully!"
            return 0
        fi

        echo "Attempt $attempt failed with exit code $exit_code"

        if [ $attempt -eq $MAX_RETRIES ]; then
            echo "ERROR: Failed to start WordPress environment on port $port after $MAX_RETRIES attempts"
            cleanup_containers "$port"
            return 1
        fi

        echo "Retrying in $RETRY_DELAY seconds..."
        cleanup_containers "$port"
        sleep $RETRY_DELAY
    done
}

npm run setup-templates

echo "Starting WordPress environments with retry logic..."

start_environment 8888
if [ $? -ne 0 ]; then
    echo "Failed to start environment on port 8888"
    exit 1
fi

start_environment 8889
if [ $? -ne 0 ]; then
    echo "Failed to start environment on port 8889"
    exit 1
fi

echo ""
echo "=== Both WordPress environments started successfully ==="
echo "  - Port 8888: http://localhost:8888"
echo "  - Port 8889: http://localhost:8889"

