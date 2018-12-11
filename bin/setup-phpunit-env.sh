#!/bin/bash

# credit: "https://github.com/WordPress/gutenberg"
# under GPL license

# Exit if any command fails.
set -e

cd "$(dirname "$0")/.."

. "$(dirname "$0")/bootstrap-env.sh"

# Include useful functions.
. "$(dirname "$0")/includes.sh"

# Check that Docker is installed.
if ! command_exists "docker"; then
	echo -e $(error_message "Docker doesn't seem to be installed. Please head on over to the Docker site to download it: $(action_format "https://www.docker.com/community-edition#/download")")
	exit 1
fi

# Check that Docker is running.
if ! docker info >/dev/null 2>&1; then
	echo -e $(error_message "Docker isn't running. Please check that you've started your Docker app, and see it in your system tray.")
	exit 1
fi

# Stop existing containers.
echo -e $(status_message "Stopping Docker containers...")
docker-compose ${DOCKER_COMPOSE_FILE_OPTIONS} down --remove-orphans >/dev/null 2>&1

# Download image updates.
echo -e $(status_message "Downloading Docker image updates...")
docker-compose ${DOCKER_COMPOSE_FILE_OPTIONS} pull

# Launch the containers.
echo -e $(status_message "Starting Docker containers...")
docker-compose ${DOCKER_COMPOSE_FILE_OPTIONS} up -d >/dev/null

# Install the PHPUnit test scaffolding.
echo -e $(status_message "Installing PHPUnit test scaffolding...")
if is_windows; then
	WP_TESTS_DIR=../tmp/wordpress-tests-lib
	WP_CORE_DIR=../tmp/wordpress
fi
docker-compose ${DOCKER_COMPOSE_FILE_OPTIONS} run --rm wordpress_phpunit dockerize -wait tcp://mysql:3306 -timeout 30s bash ./bin/install-wp-tests.sh elementor_test root password mysql $WP_VERSION false> /dev/null

# Finished Installing!
echo -e "\nTests environment is up!\n"
echo -e "Run $(action_format "npm run test:php") to run phpunit tests."
