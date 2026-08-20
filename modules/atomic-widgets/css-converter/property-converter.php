<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Property_Converter {
	/**
	 * @param array{property: string, value: string} $rule A single parsed CSS declaration.
	 */
	public function is_supported( array $rule ): bool;

	/**
	 * Mutates the shared context and returns whether the rule was converted.
	 *
	 * @param Conversion_Context                     $context The shared mutable conversion context.
	 * @param array{property: string, value: string} $rule    A single parsed CSS declaration.
	 */
	public function convert( Conversion_Context $context, array $rule ): bool;
}
