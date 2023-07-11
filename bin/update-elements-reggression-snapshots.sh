#!/usr/bin/env bash

if [ ! `which docker` ]; then
	echo 'Please install "docker"'
	exit 1
fi

docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.21.0-focal /bin/bash -c "npm i && npm run test:playwright:elements-regression:local -- -u"
