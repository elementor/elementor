#!/bin/bash
set -eox pipefail

wp --user=admin elementor experiments activate container
wp --user=admin elementor experiments activate nested-elements

wp --user=admin elementor library import-dir elementor-playwright-templates