#!/bin/bash
set -eox pipefail

wp core install --url="http://localhost:undefined" --title="test" --admin_user=admin --admin_password=password --admin_email=wordpress@example.com --skip-email