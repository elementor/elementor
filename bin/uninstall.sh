#!/bin/bash

. "$(dirname "$0")/bootstrap-env.sh"

cd "$(dirname "$0")/.."

docker-compose $DOCKER_COMPOSE_FILE_OPTIONS down --volumes --rmi all > /dev/null || true

echo  $(status_message "Done.")
