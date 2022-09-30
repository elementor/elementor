#!/bin/bash
set -eo pipefail

sed -i -E '/^Beta tag:/d' ./readme.txt
