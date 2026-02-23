#!/bin/bash

set -e

echo "Setting up Elementor test environment from current branch..."

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Building from branch: $CURRENT_BRANCH"

# Step 1: Stop and remove existing Elementor test containers
echo "Step 1: Cleaning up existing Elementor test containers"
ELEMENTOR_CONTAINERS=$(docker ps -q --filter "name=port888")
if [ -n "$ELEMENTOR_CONTAINERS" ]; then
  echo "Found running Elementor test containers:"
  docker ps --filter "name=port888" --format "table {{.Names}}\t{{.Status}}"
  if [[ "${SKIP_CONFIRMATION:-}" != "true" ]]; then
    read -p "Stop and remove these containers? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Skipping container cleanup. You may need to manually stop conflicting containers."
      echo "To skip this prompt, set SKIP_CONFIRMATION=true"
      exit 1
    fi
  fi
  echo "Stopping Elementor test containers..."
  docker stop $ELEMENTOR_CONTAINERS
fi
ELEMENTOR_CONTAINERS_ALL=$(docker ps -aq --filter "name=port888")
if [ -n "$ELEMENTOR_CONTAINERS_ALL" ]; then
  echo "Removing Elementor test containers..."
  docker rm $ELEMENTOR_CONTAINERS_ALL
fi

# Step 2: Prepare environment
echo "Step 2: Installing dependencies"
npm run prepare-environment:ci

# Step 3: Build project from current branch
echo "Step 3: Building project from $CURRENT_BRANCH"
npm run build:packages
npm run composer:no-dev
mkdir -p build/vendor
cp -R vendor/. build/vendor/
grunt scripts styles
echo "Built Elementor from $CURRENT_BRANCH (skipped full grunt build to avoid text domain warnings)"

# Step 4: Download hello-elementor theme
echo "Step 4: Downloading hello-elementor theme"
if [ -f "hello-elementor.zip" ]; then
  rm hello-elementor.zip
fi
if [ -d "hello-elementor" ]; then
  rm -rf hello-elementor
fi
curl -L --output hello-elementor.zip "https://downloads.wordpress.org/theme/hello-elementor.zip"
unzip -o hello-elementor.zip
rm hello-elementor.zip

# Step 5: Start local servers
echo "Step 5: Starting WordPress environments"
npm run start-local-server

# Step 6: Setup WordPress environments
echo "Step 6: Configuring WordPress"
npm run test:setup:playwright

echo "Test environment setup completed successfully!"
echo ""
echo "WordPress environments are ready:"
echo "   - Port 8888: http://localhost:8888"
echo "   - Port 8889: http://localhost:8889"
echo "   - Admin panel: http://localhost:8888/wp-admin/"
echo "   - Login: admin / password"
echo ""
echo "Build info:"
echo "   - Branch: $CURRENT_BRANCH"
echo "   - Elementor version: Built from current branch"
echo ""
echo "Ready for testing and development!" 