<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Stateless leaf parser: a raw CSS length-ish value -> the {size, unit} leaf a Size_Prop_Type accepts,
 * or null to decline (the caller then routes the declaration to custom_css). It never touches the
 * registry, context, or PropTypes.
 *
 * - "auto"                          -> { size: null, unit: 'auto' }
 * - calc()/clamp()/min()/max()/var()/env() -> { size: '<raw>', unit: 'custom' } (kept verbatim)
 * - "<number><unit>" (unit in all_supported_units) -> { size: <number>, unit: <unit> }
 * - unitless "0"                    -> { size: 0, unit: 'px' }
 * - anything else (unitless non-zero, unknown unit, multi-value) -> null
 */
class Size_Value_Parser {
	const NUMBER_WITH_UNIT_PATTERN = '/^(-?\d*\.?\d+)([a-z%]*)$/i';
	const DYNAMIC_FUNCTION_PATTERN = '/(?:calc|clamp|min|max|var|env)\(/i';

	/**
	 * @return array{size: mixed, unit: string}|null
	 */
	public static function parse( string $value ): ?array {
		$value = trim( $value );

		if ( '' === $value ) {
			return null;
		}

		if ( Size_Constants::UNIT_AUTO === strtolower( $value ) ) {
			return [
				'size' => null,
				'unit' => Size_Constants::UNIT_AUTO,
			];
		}

		if ( self::is_dynamic_value( $value ) ) {
			return [
				'size' => $value,
				'unit' => Size_Constants::UNIT_CUSTOM,
			];
		}

		return self::parse_number_with_unit( $value );
	}

	/**
	 * @return array{size: mixed, unit: string}|null
	 */
	private static function parse_number_with_unit( string $value ): ?array {
		if ( ! preg_match( self::NUMBER_WITH_UNIT_PATTERN, $value, $matches ) ) {
			return null;
		}

		$size = $matches[1] + 0;
		$unit = strtolower( $matches[2] );

		if ( '' === $unit ) {
			return 0.0 === (float) $size
				? [
					'size' => $size,
					'unit' => Size_Constants::DEFAULT_UNIT,
				]
				: null;
		}

		if ( ! in_array( $unit, Size_Constants::all_supported_units(), true ) ) {
			return null;
		}

		return [
			'size' => $size,
			'unit' => $unit,
		];
	}

	private static function is_dynamic_value( string $value ): bool {
		return 1 === preg_match( self::DYNAMIC_FUNCTION_PATTERN, $value );
	}
}
