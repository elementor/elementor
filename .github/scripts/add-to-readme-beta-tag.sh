#!/bin/bash
set -eo pipefail

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

if grep -q "Beta tag:" ./readme.txt
then
	echo "Replace existing beta tag in readme file"
	sed -i -E "s/Beta tag: .*/Beta tag: ${PACKAGE_VERSION}/g" ./readme.txt
else
	echo "Add beta tag to readme file"
  sed -i -E '/^Stable tag: .*/a\'$'\n'"Beta tag: ${PACKAGE_VERSION}$(printf '\n\r')" ./readme.txt
fi
