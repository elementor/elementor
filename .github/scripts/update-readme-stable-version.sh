#!/bin/bash
set -eo pipefail

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

sed -i -E "s/Stable tag: .*/Stable tag: ${PACKAGE_VERSION}/g" ./readme.txt
