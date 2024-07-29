#!/bin/bash
set -eo pipefail

# Initialize variables
DEV_MODE=false
NPM_ONLY=false

# Parse command-line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dev)
            DEV_MODE=true
            ;;
        --npm-only)
            NPM_ONLY=true
            ;;
        *)
            echo "Unknown parameter passed: $1"
            exit 1
            ;;
    esac
    shift
done

echo "DEV_MODE: $DEV_MODE"

# If --npm-only flag is set, skip all Composer commands
if [ "$NPM_ONLY" = true ]; then
    echo "Installing NPM dependencies only..."
    npm ci
    echo "NPM dependencies installed"
    exit 0
fi

# Install Composer dependencies with optimized autoloader and preferred distribution
composer install --optimize-autoloader --prefer-dist

# Install Composer dependencies without scripts and dev dependencies if DEV_MODE is false
if [ "$DEV_MODE" = false ]; then
    composer install --no-scripts --no-dev
fi

# Dump Composer autoload files
composer dump-autoload

# Install NPM dependencies
npm ci

# Echo message
echo "Dependencies installed"
