#!/bin/bash

# Elementor Testing Environment Setup Script
# Usage: npm run setup:testing [--restart]

set -e  # Exit on any error

# Check if restart flag is provided
RESTART_MODE=false
if [[ "$1" == "--restart" ]]; then
    RESTART_MODE=true
    echo "🔄 Restarting Elementor Testing Environment..."
else
    echo "🚀 Setting up Elementor Testing Environment..."
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi
print_status "Docker is running"

# Check if Node.js is installed
if ! command -v node > /dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi
print_status "Node.js is installed ($(node --version))"

# Check if npm is installed
if ! command -v npm > /dev/null 2>&1; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi
print_status "npm is installed ($(npm --version))"

# Create .env file if it doesn't exist
echo "📝 Setting up environment configuration..."
if [ ! -f .env ]; then
    cat > .env << EOF
# WordPress Admin Credentials
USERNAME=admin
PASSWORD=password

# WordPress URLs for testing
BASE_URL=http://localhost:8888
ELEMENTS_REGRESSION_BASE_URL=http://localhost:8889

# Test Configuration
TEST_PARALLEL_INDEX=0

# Optional: Elementor Experiments (uncomment to enable)
# ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS=true

# Optional: Debug Settings (uncomment to enable)
# SCRIPT_DEBUG=true
# WP_DEBUG=true
EOF
    print_status "Created .env file with default configuration"
else
    print_warning ".env file already exists, skipping creation"
fi

# Install npm dependencies
echo "📦 Installing dependencies..."
npm install
print_status "Dependencies installed"

# Clean up any existing containers (always do this for both modes)
echo "🧹 Cleaning up existing containers..."
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Clean storage state files if restarting
if [ "$RESTART_MODE" = true ]; then
    rm -f test-results/.storageState-*.json
    print_status "Cleaned up containers and storage"
else
    print_status "Cleaned up existing containers"
fi

# Start WordPress environment
echo "🌐 Starting WordPress environment..."
npm run start-local-server
print_status "WordPress environment started"

# Wait for WordPress to be ready
echo "⏳ Waiting for WordPress to be ready..."
sleep 10

# Check if WordPress is accessible
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:8888 > /dev/null 2>&1; then
        break
    fi
    echo "Attempt $attempt/$max_attempts: WordPress not ready yet, waiting..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_error "WordPress failed to start after $max_attempts attempts"
    exit 1
fi

print_status "WordPress is accessible"

# Clean WordPress content
echo "🧹 Cleaning WordPress content..."
docker exec port8888-cli-1 wp post delete $(docker exec port8888-cli-1 wp post list --post_type=post --format=ids) --force 2>/dev/null || true
docker exec port8888-cli-1 wp post delete $(docker exec port8888-cli-1 wp post list --post_type=page --format=ids) --force 2>/dev/null || true
docker exec port8888-cli-1 wp comment delete $(docker exec port8888-cli-1 wp comment list --format=ids) --force 2>/dev/null || true

docker exec port8889-cli-1 wp post delete $(docker exec port8889-cli-1 wp post list --post_type=post --format=ids) --force 2>/dev/null || true
docker exec port8889-cli-1 wp post delete $(docker exec port8889-cli-1 wp post list --post_type=page --format=ids) --force 2>/dev/null || true
docker exec port8889-cli-1 wp comment delete $(docker exec port8889-cli-1 wp comment list --format=ids) --force 2>/dev/null || true

print_status "WordPress content cleaned"

# Install/Fix Elementor plugin
echo "🔌 Setting up Elementor plugin..."

# Always try to fix mount issues by downloading stable version
print_warning "Ensuring Elementor is properly installed..."
curl -L -o /tmp/elementor.zip https://downloads.wordpress.org/plugin/elementor.latest-stable.zip
unzip -q /tmp/elementor.zip -d /tmp/
rm -rf build/*
cp -r /tmp/elementor/* build/
rm -rf /tmp/elementor.zip /tmp/elementor

# Activate the plugin
docker exec port8888-cli-1 wp plugin activate elementor 2>/dev/null || docker exec port8888-cli-1 wp plugin install elementor --activate
docker exec port8889-cli-1 wp plugin activate elementor 2>/dev/null || docker exec port8889-cli-1 wp plugin install elementor --activate

print_status "Elementor plugin installed and activated"

# Verify setup
echo "🔍 Verifying setup..."

# Check WordPress accessibility
if ! curl -f http://localhost:8888 > /dev/null 2>&1; then
    print_error "WordPress on port 8888 is not accessible"
    exit 1
fi

if ! curl -f http://localhost:8889 > /dev/null 2>&1; then
    print_error "WordPress on port 8889 is not accessible"
    exit 1
fi

# Check Elementor plugin
if ! docker exec port8888-cli-1 wp plugin list | grep -q "elementor.*active"; then
    print_error "Elementor plugin is not active on port 8888"
    exit 1
fi

if ! docker exec port8889-cli-1 wp plugin list | grep -q "elementor.*active"; then
    print_error "Elementor plugin is not active on port 8889"
    exit 1
fi

print_status "Setup verification completed successfully"

echo ""
echo "🎉 Elementor Testing Environment Setup Complete!"
echo ""
echo "📋 What's been set up:"
echo "   • WordPress running on http://localhost:8888 and http://localhost:8889"
echo "   • Admin credentials: admin / password"
echo "   • Elementor plugin installed and activated"
echo "   • Environment configured for testing"
echo ""
echo "🚀 Next steps:"
echo "   • Run tests: npm run test:elements-regression"
echo "   • Run Playwright tests: npm run test:playwright"
echo "   • View setup guide: cat TESTING_SETUP.md"
echo ""
echo "🛠️  Useful commands:"
echo "   • Clean restart: npm run restart:testing"
echo "   • Start environment: npm run start-local-server"
echo "   • View setup guide: cat TESTING_SETUP.md"
echo ""
