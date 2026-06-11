<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Metrics;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Conversion_Failure_Reporter {
	const CATEGORY_EXCEPTION = 'exception';
	const CATEGORY_NULL_RETURN = 'null_return';

	/**
	 * @param string $property The CSS property that failed to convert.
	 * @param string $category One of the CATEGORY_* constants.
	 * @param array  $context  Sanitized reproduction context, free of user content.
	 */
	public function report( string $property, string $category, array $context ): void;
}
