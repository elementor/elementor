#!/bin/bash

# credit: "https://github.com/WordPress/gutenberg"
# under GPL license

# Exit if any command fails
set -e

# Set up environment variables
. "$(dirname "$0")/bootstrap-env.sh"

# Include useful functions
. "$(dirname "$0")/includes.sh"

# Change to the expected directory
cd "$(dirname "$0")/.."

# Check Docker is installed and running
. "$(dirname "$0")/install-docker.sh"

echo -e "\nTests environment is up!\n"
echo -e "Run $(action_format "npm run test:phpunit") to run phpunit tests."
