<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Guards against writing V3 control values in a shape the legacy CSS pipeline cannot read.
 */
class V3_Control_Value_Compatibility {

	const SCALAR_CONTROL_TYPES = [
		'select',
		'choose',
		'animation',
		'visual_choice',
		'text',
		'number',
	];

	const DIMENSION_PROPERTIES = [
		'width',
		'height',
		'max-width',
		'min-height',
		'font-size',
		'line-height',
		'letter-spacing',
		'word-spacing',
		'opacity',
		'top',
		'right',
		'bottom',
		'left',
	];

	const STRUCTURED_RESOLVERS = [
		'dimension',
		'sides',
		'dimension_side',
		'box_shadow',
		'border',
	];

	public static function infer_resolver( array $control, string $property ): string {
		$type = $control['type'] ?? null;

		if ( 'color' === $type || str_ends_with( $property, 'color' ) || 'fill' === $property ) {
			return 'color';
		}

		if ( in_array( $property, [ 'padding', 'margin', 'border-radius' ], true ) ) {
			return 'sides';
		}

		if ( in_array( $type, [ 'slider', 'dimensions' ], true ) ) {
			return 'dimensions' === $type ? 'sides' : 'dimension';
		}

		if ( self::is_scalar_control_type( $type ) ) {
			return 'text';
		}

		if ( in_array( $property, self::DIMENSION_PROPERTIES, true ) ) {
			return 'dimension';
		}

		if ( 'box-shadow' === $property ) {
			return 'box_shadow';
		}

		if ( 'border' === $property ) {
			return 'border';
		}

		return 'text';
	}

	public static function accepts( array $control, string $resolver, mixed $resolved ): bool {
		$type = $control['type'] ?? null;

		if ( ! is_string( $type ) || '' === $type ) {
			return true;
		}

		if ( in_array( $resolver, self::STRUCTURED_RESOLVERS, true ) ) {
			if ( 'box_shadow' === $resolver ) {
				return 'box_shadow' === $type;
			}

			if ( in_array( $type, [ 'slider', 'dimensions' ], true ) ) {
				return true;
			}

			return false;
		}

		if ( 'color' === $resolver ) {
			return 'color' === $type;
		}

		if ( is_array( $resolved ) && self::is_scalar_control_type( $type ) ) {
			return false;
		}

		return true;
	}

	private static function is_scalar_control_type( mixed $type ): bool {
		return is_string( $type ) && in_array( $type, self::SCALAR_CONTROL_TYPES, true );
	}
}
