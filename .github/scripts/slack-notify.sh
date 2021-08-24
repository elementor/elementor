#!/bin/bash
set -eo pipefail

if [[ -z "$SLACK_TOKEN" ]]; then
	echo "Missing SLACK_TOKEN env var"
	exit 1
fi

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

if [[ -z "$SLACK_CHANNELS" ]]; then
	echo "Missing SLACK_CHANNELS env var"
	exit 1
fi

SLACK_CHANNELS_ARRAY=(`echo $SLACK_CHANNELS | sed 's/,/\n/g'`)
SLACK_BOT_NAME="ElementorBot"

messageText="@channel Elementor \`v${PACKAGE_VERSION}\` has been released! Saddle up partners!"
for CHANNEL in "${SLACK_CHANNELS_ARRAY[@]}"
do
	curl -X POST "https://slack.com/api/chat.postMessage" -d "username=${SLACK_BOT_NAME}&token=${SLACK_TOKEN}&channel=${CHANNEL}&text=${messageText}&link_names=true"
done
