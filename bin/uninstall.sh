#!/bin/bash

set -e

. "$(dirname "$0")/bootstrap-env.sh"
. "$(dirname "$0")/includes.sh"

cd "$(dirname "$0")/.."

docker-compose ${DOCKER_COMPOSE_FILE_OPTIONS} down --volumes --rmi all --remove-orphans > /dev/null

echo  $(status_message "Done.")
