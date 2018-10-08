#!/usr/bin/env bash

# credit: "https://github.com/WordPress/gutenberg"
# under GPL license

WP_VERSION=${WP_VERSION-latest}
DOCKER=${DOCKER-false}
DOCKER_ENV=${DOCKER_ENV-ci}
DOCKER_COMPOSE_FILE_OPTIONS="-f docker-compose.yml"
