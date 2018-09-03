#!/bin/bash

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

#CURRENT_URL=$(docker-compose $DOCKER_COMPOSE_FILE_OPTIONS run -T --rm cli option get siteurl)

echo -e "\nWelcome to elementor!\n"
#echo -e "Run $(action_format "npm run dev"), then open $(action_format "$CURRENT_URL") to get started!"
