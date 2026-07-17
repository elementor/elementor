<?php
/**
 * DEMO: DO NOT MERGE.
 *
 * Purpose: prove that bin/check-twig-safety.sh in CI catches a real Twig
 * usage that would violate an assumption behind the ignored advisories in
 * composer.json. This file is not autoloaded and is never executed - it
 * only exists so the lint job fails on this branch.
 *
 * Expected CI outcome:
 *   Lint / PHP-Lint  ->  step "Twig safety check"  ->  FAIL (exit 1)
 *   with an "::error::Forbidden Twig usage detected ..." message pointing here.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$env->enableSandbox();
