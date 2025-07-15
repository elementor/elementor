#!/bin/bash

set -e

# Get current version from package.json
if [ -f "package.json" ]; then
  CURRENT_VERSION=$(jq -r '.version' package.json)
else
  echo "package.json not found!"
  exit 1
fi

# Calculate next minor version for default
MAJOR=$(echo "$CURRENT_VERSION" | awk -F. '{print $1}')
MINOR=$(echo "$CURRENT_VERSION" | awk -F. '{print $2}')
NEXT_MINOR=$((MINOR + 1))
DEFAULT_NEXT_VERSION="$MAJOR.$NEXT_MINOR.0"

# Accept next version as input (default: next minor version)
if [ -z "$1" ]; then
  read -p "Enter next version for main (new dev version) [Default: $DEFAULT_NEXT_VERSION]: " NEXT_VERSION
  NEXT_VERSION=${NEXT_VERSION:-$DEFAULT_NEXT_VERSION}
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

BRANCH_NAME="$MAJOR.$MINOR"

# Get current git branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current version (from package.json): $CURRENT_VERSION"
echo "Next version (input/dev bump): $NEXT_VERSION"
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
# Only create the release branch if not exists
execOrLog "git fetch origin main"
if git show-ref --verify --quiet refs/heads/origin/"$BRANCH_NAME"; then
    echo "Branch $BRANCH_NAME already exists remotely."
    exit 0
else
    execOrLog "git checkout -b $BRANCH_NAME origin/main"
    execOrLog "git push origin $BRANCH_NAME"
    echo "Created and pushed branch $BRANCH_NAME from main."
    execOrLog "git checkout main"
fi

# 2. Dev bump logic
DEV_VERSION="$NEXT_VERSION"
DEV_BRANCH="version-$DEV_VERSION-to-main"
execOrLog "git checkout -b $DEV_BRANCH main"
if [ -f "elementor.php" ]; then
    echo "Updating elementor.php to next version..."
    execOrLog "sed -i '' -E 's/(\* Version: )[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?/\1$DEV_VERSION/' elementor.php"
    execOrLog "sed -i '' -E 's/(define\( 'ELEMENTOR_VERSION', ')[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?'\)/\1$DEV_VERSION'\)/' elementor.php"
else
    echo "elementor.php not found!"
    exit 1
fi
if [ -f "package.json" ]; then
    echo "Updating package.json to next version..."
    execOrLog "jq --arg v \"$DEV_VERSION\" '.version = \$v' package.json > package.json.tmp && mv package.json.tmp package.json"
    execOrLog "npm i"
else
    echo "package.json not found!"
    exit 1
fi
echo "Version bump complete. Please open a PR from $DEV_BRANCH to main."

echo "Done! Please review the changes and commit them."