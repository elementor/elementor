#!/bin/bash

. "$(dirname "$0")/bootstrap-env.sh"

. "$(dirname "$0")/includes.sh"

cd "$(dirname "$0")/.."

if [ "$EUID" -ne 0 ]
  then echo "to uninstall plaese run as root"
  exit
fi

docker-compose $DOCKER_COMPOSE_FILE_OPTIONS down --volumes --rmi local > /dev/null || true

docker rmi $(cat local-site/docker-images-id | sed 1d) > /dev/null || true

rm -rf local-site
