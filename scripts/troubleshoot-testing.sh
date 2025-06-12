#!/bin/bash

# Elementor Testing Environment Troubleshooting Script
set -e

echo "🔧 Elementor Testing Troubleshooter"
echo "==================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check system prerequisites
echo -e "\n🔍 System Check"
docker info > /dev/null 2>&1 && print_status "Docker running" || { print_error "Docker not running"; exit 1; }
command -v node > /dev/null && print_status "Node.js available" || { print_error "Node.js missing"; exit 1; }
[ -f .env ] && print_status ".env exists" || print_warning ".env missing - run: npm run setup:testing"

# Check containers
echo -e "\n🐳 Containers"
if [ -z "$(docker ps -q)" ]; then
    print_warning "No containers running - run: npm run start-local-server"
else
    docker ps | grep -q "port8888-wordpress" && print_status "WordPress 8888 running" || print_error "WordPress 8888 missing"
    docker ps | grep -q "port8889-wordpress" && print_status "WordPress 8889 running" || print_error "WordPress 8889 missing"
fi

# Check WordPress accessibility
echo -e "\n🌐 WordPress Access"
curl -f -s http://localhost:8888 > /dev/null && print_status "Port 8888 accessible" || print_error "Port 8888 not accessible"
curl -f -s http://localhost:8889 > /dev/null && print_status "Port 8889 accessible" || print_error "Port 8889 not accessible"

# Check Elementor
echo -e "\n🔌 Elementor Plugin"
if docker ps | grep -q "port8888-cli"; then
    if docker exec port8888-cli-1 wp plugin list --format=csv | grep -q elementor; then
        print_status "Elementor on 8888"
    else
        # Check if it's a mount issue (empty directory)
        if docker exec port8888-cli-1 test -d /var/www/html/wp-content/plugins/elementor && [ -z "$(docker exec port8888-cli-1 ls -A /var/www/html/wp-content/plugins/elementor)" ]; then
            print_error "Elementor directory empty (mount issue) - run: npm run fix:elementor"
        else
            print_error "Elementor missing on 8888"
        fi
    fi
fi
if docker ps | grep -q "port8889-cli"; then
    docker exec port8889-cli-1 wp plugin list --format=csv | grep -q elementor && print_status "Elementor on 8889" || print_error "Elementor missing on 8889"
fi

# Check authentication
echo -e "\n🔐 Authentication"
storage_files=$(find test-results -name ".storageState-*.json" 2>/dev/null | wc -l)
[ "$storage_files" -gt 0 ] && print_warning "Found $storage_files storage files - clear with: npm run restart:clean" || print_status "No stale auth files"

# Solutions
echo -e "\n🛠️  Quick Fixes"
echo "Complete restart:     npm run restart:clean"
echo "Fresh setup:          npm run setup:testing"
echo "Fix Elementor mount:  npm run fix:elementor"
echo "Start environment:    npm run start-local-server"
echo "View full guide:      cat TESTING_SETUP.md"

echo -e "\n🏁 Troubleshooting complete!" 