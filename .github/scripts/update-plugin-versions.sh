#!/bin/bash
set -eo pipefail

sed -i -E "s/Stable tag: .*/Stable tag: ${PACKAGE_VERSION }/g" ./readme.txt
sed -i -E "s/Version: .*/Version: ${ PACKAGE_VERSION }/g" elementor.php
sed -i -E "s/ELEMENTOR_VERSION', '.*'/ELEMENTOR_VERSION', '${ PACKAGE_VERSION }'/g" elementor.php