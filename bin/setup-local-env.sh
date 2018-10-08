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

npm i

# Check Docker is installed and running
. "$(dirname "$0")/install-docker.sh"

echo -e "\nWelcome To Elementor!\n"
echo -e "Run $(action_format "npm run dev"), then open $(action_format "$CURRENT_URL") to get started!\nusername: admin\npassword: password"
