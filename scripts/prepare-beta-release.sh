#!/bin/bash

set -e

# Get current version from package.json
if [ -f "package.json" ]; then
  CURRENT_VERSION=$(jq -r '.version' package.json)
else
  echo "package.json not found!"
  exit 1
fi

# Accept version from argument or prompt the user
if [ -z "$1" ]; then
  PROPOSED_VERSION=$(echo "$CURRENT_VERSION" | awk -F. '{print $1"."$2+1"."$3}')
  read -p "Enter next full version [Current: ${CURRENT_VERSION}, Enter accepts next: ${PROPOSED_VERSION}]: " NEXT_VERSION
  NEXT_VERSION=${NEXT_VERSION:-$PROPOSED_VERSION}
else
  NEXT_VERSION="$1"
fi

# Accept dry-run as argument or prompt
if [ -z "$2" ]; then
  read -p "Dry run? (y/N): " DRY_RUN_INPUT
  if [[ "$DRY_RUN_INPUT" =~ ^[Yy]$ ]]; then
    DRY_RUN=true
  else
    DRY_RUN=false
  fi
else
  if [[ "$2" == "--dry-run" || "$2" == "-d" ]]; then
    DRY_RUN=true
  else
    DRY_RUN=false
  fi
fi

BRANCH_NAME="$(echo "$NEXT_VERSION" | awk -F. '{print $1"."$2}')"

# Get current git branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Only allow operation if on main or release branch (e.g. 3.**)
if [[ "$CURRENT_BRANCH" != "main" && ! "$CURRENT_BRANCH" =~ ^[0-9]+\.[0-9]+$ ]]; then
  echo "Error: You must be on 'main' or a release branch (e.g. 3.**) to run this script. Current branch: $CURRENT_BRANCH"
  exit 1
fi

echo "Next version: $NEXT_VERSION"
echo "Branch name: $BRANCH_NAME"
echo "Dry run: $DRY_RUN"
echo "Base branch: $CURRENT_BRANCH"

execOrLog() {
  if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN: $1"
  else
    eval "$1"
  fi
}

# 1. Branch logic
if [ "$CURRENT_BRANCH" = "main" ]; then
  # Only create the release branch if on main
  execOrLog "git fetch origin main"
  if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
    echo "Branch $BRANCH_NAME already exists locally."
    execOrLog "git checkout $BRANCH_NAME"
  else
    execOrLog "git checkout -b $BRANCH_NAME origin/main"
    echo "Created branch $BRANCH_NAME from main."
  fi
else
  # On a release branch, do not create or checkout any branch, just continue
  echo "On release branch $CURRENT_BRANCH, will not create or checkout any branch."
fi

# 2. Update elementor.php
if [ -f "elementor.php" ]; then
  echo "Updating elementor.php..."
  execOrLog "sed -i '' -E 's/(\* Version: )[0-9]+\.[0-9]+\.[0-9]+/\1$NEXT_VERSION/' elementor.php"
  execOrLog "sed -i '' -E 's/(define\( 'ELEMENTOR_VERSION', ')[0-9]+\.[0-9]+\.[0-9]+'\/\1$NEXT_VERSION'/' elementor.php
else
  echo "elementor.php not found!"
  exit 1
fi

# 3. Update package.json
if [ -f "package.json" ]; then
  echo "Updating package.json..."
  execOrLog "jq --arg v '$NEXT_VERSION' '.version = \$v' package.json > package.json.tmp && mv package.json.tmp package.json"
else
  echo "package.json not found!"
  exit 1
fi

echo "Done! Please review the changes and commit them."