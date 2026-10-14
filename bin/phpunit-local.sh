#!/usr/bin/env bash

set -e

CONTAINER_NAME="elementor-wp-tests-mysql"
DB_NAME="wordpress_test"
DB_USER="root"
DB_PASSWORD="root"
DB_PORT="3306"
DB_HOST="127.0.0.1:${DB_PORT}"
WP_VERSION="${WP_VERSION:-latest}"
WP_TESTS_DIR="/tmp/wordpress-tests-lib"

check_docker() {
  if ! command -v docker &>/dev/null; then
    echo "Error: Docker is not installed or not in PATH."
    exit 1
  fi
}

check_svn() {
  if ! command -v svn &>/dev/null; then
    echo "Error: svn is not installed or not in PATH."
    echo "Mac: brew install subversion"
    echo "Linux: sudo apt-get install subversion"
    exit 1
  fi
}

recreate_test_database() {
  docker exec "${CONTAINER_NAME}" mysql -u"${DB_USER}" -p"${DB_PASSWORD}" \
    -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`; CREATE DATABASE \`${DB_NAME}\`;"
}

find_container_on_port() {
  docker ps --format '{{.Names}}\t{{.Ports}}' | awk -F'\t' -v port=":${DB_PORT}->" '$2 ~ port {print $1}' | head -1
}

start_mysql_container() {
  local existing_on_port
  existing_on_port=$(find_container_on_port)

  if [ -n "${existing_on_port}" ]; then
    echo "Reusing running container '${existing_on_port}' already bound to port ${DB_PORT}."
    CONTAINER_NAME="${existing_on_port}"
  else
    local status
    status=$(docker inspect --format '{{.State.Status}}' "${CONTAINER_NAME}" 2>/dev/null | tr -d '[:space:]' || echo "missing")
    status="${status:-missing}"

    if [ "${status}" = "exited" ] || [ "${status}" = "created" ]; then
      echo "Starting existing MySQL container '${CONTAINER_NAME}'..."
      docker start "${CONTAINER_NAME}"
    elif [ "${status}" = "missing" ]; then
      local arch
      arch=$(uname -m)
      local mysql_image="mysql:8.0"
      if [ "${arch}" = "arm64" ]; then
        mysql_image="mysql:8.4"
      fi
      echo "Pulling MySQL image '${mysql_image}'..."
      docker pull "${mysql_image}"
      echo "Creating MySQL container '${CONTAINER_NAME}'..."
      docker run --name "${CONTAINER_NAME}" \
        -e MYSQL_ROOT_PASSWORD="${DB_PASSWORD}" \
        -p "${DB_PORT}:3306" \
        -d "${mysql_image}"
    fi
  fi

  echo "Waiting for MySQL to be ready..."
  local timeout=60
  local elapsed=0
  until docker exec "${CONTAINER_NAME}" mysqladmin ping -u"${DB_USER}" -p"${DB_PASSWORD}" --silent 2>/dev/null; do
    if [ "${elapsed}" -ge "${timeout}" ]; then
      echo ""
      echo "Error: MySQL in container '${CONTAINER_NAME}' did not respond within ${timeout}s."
      echo ""
      local conflicting
      conflicting=$(find_container_on_port)
      if [ -n "${conflicting}" ] && [ "${conflicting}" != "${CONTAINER_NAME}" ]; then
        echo "A different container is running on port ${DB_PORT}: '${conflicting}'"
        echo "It may use different credentials than expected (user: ${DB_USER}, password: ${DB_PASSWORD})."
        echo "Stop it and re-run:"
        echo "  docker stop ${conflicting}"
      else
        echo "The container may still be initializing. Check its logs:"
        echo "  docker logs ${CONTAINER_NAME}"
      fi
      exit 1
    fi
    sleep 1
    elapsed=$(( elapsed + 1 ))
  done
  echo "MySQL is ready."
}

install_wp_test_suite() {
  rm -rf "${WP_TESTS_DIR}" /tmp/wordpress

  recreate_test_database

  SKIP_INSTALL_DB=1 WP_TESTS_DIR="${WP_TESTS_DIR}" \
    bash bin/install-wp-tests.sh "${DB_NAME}" "${DB_USER}" "${DB_PASSWORD}" "${DB_HOST}" "${WP_VERSION}"
}

check_docker
check_svn
start_mysql_container
install_wp_test_suite

echo ""
echo "Setup complete. Running tests..."
echo ""

FILTER="${1:-}"

if [ -n "${FILTER}" ]; then
  WP_TESTS_DIR="${WP_TESTS_DIR}" ./vendor/bin/phpunit --filter "${FILTER}"
else
  WP_TESTS_DIR="${WP_TESTS_DIR}" composer run test
fi
