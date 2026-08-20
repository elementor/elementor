<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A pre-processing pass that rewrites a single shorthand declaration (e.g. `border`) into the
 * longhand declarations the schema-bound converters already understand. Runs before the converter
 * loop so the converter registry stays a 1:1 mirror of Style_Schema and the shorthand never becomes a
 * prop or a coverage key.
 */
interface Shorthand_Expander {
	/**
	 * @param array{property: string, value: string} $rule A single parsed CSS declaration.
	 */
	public function is_supported( array $rule ): bool;

	/**
	 * Rewrite the shorthand into longhand declarations. Returning an empty array declines the
	 * expansion, so the original shorthand is kept and routed to custom_css.
	 *
	 * @param array{property: string, value: string} $rule
	 * @return array<int, array{property: string, value: string, declaration: string}>
	 */
	public function expand( array $rule ): array;
}
