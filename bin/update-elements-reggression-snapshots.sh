#!/usr/bin/env bash

if [ ! `which docker` ]; then
	echo 'Please install "docker"'
	exit 1
fi

docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.27.1-focal /bin/bash -c "npm ci && npm run test:elements-regression:local -- -u"
