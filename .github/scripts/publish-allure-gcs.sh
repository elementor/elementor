#!/bin/bash
set -euo pipefail

TRACE_RETENTION_DAYS="${TRACE_RETENTION_DAYS:-3}"

REPORT_DIR="${1:-}"
BUCKET="${2:-}"
DEST="${3:-}"

if [[ -z "${REPORT_DIR}" || -z "${BUCKET}" || -z "${DEST}" ]]; then
	echo "::error::Usage: publish-allure-gcs.sh <report-dir> <bucket> <dest-prefix>"
	exit 1
fi

if [[ ! -d "${REPORT_DIR}" ]]; then
	echo "::error::Allure report directory '${REPORT_DIR}' does not exist"
	exit 1
fi

apply_report_lifecycle() {
	local lifecycle_file
	lifecycle_file="$(mktemp)"
	cat > "${lifecycle_file}" <<EOF
{
  "rule": [
    {
      "action": { "type": "Delete" },
      "condition": {
        "age": ${TRACE_RETENTION_DAYS},
        "matchesSuffix": [".zip"]
      }
    },
    {
      "action": { "type": "Delete" },
      "condition": {
        "age": ${TRACE_RETENTION_DAYS},
        "matchesPrefix": ["main/data/"]
      }
    }
  ]
}
EOF
	if gcloud storage buckets update "gs://${BUCKET}" --lifecycle-file="${lifecycle_file}"; then
		echo "Set ${TRACE_RETENTION_DAYS}-day lifecycle for traces and stale main/data objects on gs://${BUCKET}"
	else
		echo "::warning::Could not set GCS lifecycle on gs://${BUCKET}. The publish service account needs storage.buckets.update. This run still uploaded the report."
	fi
	rm -f "${lifecycle_file}"
}

gcloud storage cp --recursive "${REPORT_DIR}/." "gs://${BUCKET}/${DEST}/"
apply_report_lifecycle
