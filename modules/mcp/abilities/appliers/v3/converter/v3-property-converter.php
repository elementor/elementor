<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps a single parsed CSS declaration onto V3 legacy settings.
 *
 * Mirrors the pattern of the atomic-widgets CSS converter
 * ({@see \Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter}) but writes
 * flat legacy-shape values into a {@see V3_Conversion_Context} instead of V4 PropValues.
 *
 * $rule shape: [
 *   'property'   => 'color',       // lowercase CSS property
 *   'value'      => 'red',
 *   'state'      => 'hover'|null,  // normalized pseudo-state (hover|focus|active|null)
 *   'breakpoint' => 'desktop',
 * ]
 */
interface V3_Property_Converter {

	public function is_supported( array $rule, V3_Context_Meta $meta ): bool;

	/**
	 * @return bool True when the converter emitted something (or intentionally consumed
	 *              the rule as a no-op); false when the value could not be mapped and the
	 *              orchestrator should mark the rule as unmapped.
	 */
	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool;
}
