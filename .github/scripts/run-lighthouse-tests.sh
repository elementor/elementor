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
   pnpm exec lhci collect --url="http://localhost:8889/${TEMPLATE_NAME}/"
   pnpm exec lhci assert
   set_max_exit
   pnpm exec lhci upload --outputDir="${GITHUB_WORKSPACE}/.lighthouseci/reports/${TEMPLATE_NAME}/"
done

exit "$max_exit"
