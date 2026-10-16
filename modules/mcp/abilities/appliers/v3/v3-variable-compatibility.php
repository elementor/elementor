<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * V4 global variables are emitted to the active kit's `:root` as CSS custom properties,
 * so a `var(--x)` reference works inside V3 control values only when the control stores
 * a raw string that becomes the CSS value verbatim (colors, text). V3 slider and
 * dimension controls store `{size, unit}` shapes that cannot represent a `var()`, and
 * unitless typography settings coerce numerics — those must reject `var()` inputs and
 * surface an actionable warning back to the caller.
 */
class V3_Variable_Compatibility {

	const SUPPORTED_PROPERTIES = [
		'color',
		'background-color',
		'border-color',
		'border-top-color',
		'border-right-color',
		'border-bottom-color',
		'border-left-color',
		'outline-color',
		'fill',
		'stroke',
		'caret-color',
		'text-decoration-color',
	];

	public static function supports( string $css_property ): bool {
		return in_array( self::normalize( $css_property ), self::SUPPORTED_PROPERTIES, true );
	}

	public static function reject_reason( string $css_property ): string {
		return sprintf(
			'V3 sliders and dimension controls store {size, unit} shapes and cannot hold CSS variables. Set `%s` as a literal value, or apply it via a V4 element/global class.',
			self::normalize( $css_property )
		);
	}

	public static function is_var_reference( string $css_value ): bool {
		return 1 === preg_match( '/^\s*var\s*\(/i', $css_value );
	}

	private static function normalize( string $css_property ): string {
		return strtolower( trim( $css_property ) );
	}
}
