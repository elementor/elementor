<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Metrics;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Default no-op reporter. Real telemetry (channel, payload, PII policy) is deferred to Phase 4.
 */
class Null_Failure_Reporter implements Conversion_Failure_Reporter {
	public function report( string $property, string $category, array $context ): void {
	}
}
