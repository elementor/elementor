#!/bin/bash

TEMPLATES_FILE_NAMES=`ls ${GITHUB_WORKSPACE}/tests/lighthouse/templates/*.json`
max_exit=0

set_max_exit() {
  for i in "${PIPESTATUS[@]}"; do
    [ "$i" -gt "$max_exit" ] && max_exit=$i
  done
}

for TEMPLATE_FILE_NAME in $TEMPLATES_FILE_NAMES
do
   TEMPLATE_NAME=$(basename "$TEMPLATE_FILE_NAME" .json)
   export TEMPLATE_NAME=${TEMPLATE_NAME}
   npx lhci collect --url="http://localhost:8888/${TEMPLATE_NAME}/"
   npx lhci assert
   set_max_exit
   npx lhci upload --outputDir="${GITHUB_WORKSPACE}/.lighthouseci/reports/${TEMPLATE_NAME}/"
done

exit "$max_exit"
