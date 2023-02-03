#!/bin/bash
set -eo pipefail

echo "Set git bot user"
git config user.name ${MAINTAIN_USERNAME}
git config user.email ${MAINTAIN_EMAIL}
