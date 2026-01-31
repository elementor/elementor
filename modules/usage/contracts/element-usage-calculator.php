<?php

namespace Elementor\Modules\Usage\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Element_Usage_Calculator {

	/**
	 * Check if this calculator can handle the given element.
	 *
	 * @param array $element The element data array.
	 * @param mixed $element_instance The widget or element instance (or null if not found).
	 *
	 * @return bool True if this calculator should handle the element.
	 */
	public function can_calculate( array $element, $element_instance ): bool;

	/**
	 * Calculate usage data for a single element.
	 *
	 * @param array $element The element data array.
	 * @param mixed $element_instance The widget or element instance (or null if not found).
	 * @param array $existing_usage Existing usage data to merge with.
	 *
	 * @return array The updated usage data with this element's usage included.
	 */
	public function calculate( array $element, $element_instance, array $existing_usage ): array;
}
