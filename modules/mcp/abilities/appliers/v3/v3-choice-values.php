<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Translates between CSS values and the option keys of a SELECT / CHOOSE control.
 * The value map (`css value => option key`) is derived from the control's
 * `selectors_dictionary` when present, otherwise each option key is its own CSS value.
 */
class V3_Choice_Values {

	const DECLARATION_SEPARATOR = ':';

	/**
	 * @param array<string, mixed>       $control
	 * @param array<string, string>|null $css_values Explicit `css value => option key` pairs.
	 * @return array<string, string>|null Null when the control cannot back a single CSS value.
	 */
	public static function build_value_map( array $control, ?array $css_values = null ): ?array {
		$options = is_array( $control['options'] ?? null ) ? $control['options'] : [];

		if ( null !== $css_values ) {
			return self::are_option_keys( array_values( $css_values ), $options ) ? self::normalize_keys( $css_values ) : null;
		}

		$dictionary = $control['selectors_dictionary'] ?? null;

		if ( is_array( $dictionary ) && ! empty( $dictionary ) ) {
			return self::invert_dictionary( $dictionary );
		}

		$value_map = [];

		foreach ( array_keys( $options ) as $option_key ) {
			if ( '' === (string) $option_key ) {
				continue;
			}

			$value_map[ strtolower( (string) $option_key ) ] = (string) $option_key;
		}

		return empty( $value_map ) ? null : $value_map;
	}

	public static function resolve( array $value_map, string $css_value ): ?string {
		return $value_map[ strtolower( trim( $css_value ) ) ] ?? null;
	}

	/**
	 * @param array<string, string> $value_map
	 * @param mixed                 $option_key
	 */
	public static function format( array $value_map, $option_key ): ?string {
		if ( ! is_string( $option_key ) || '' === $option_key ) {
			return null;
		}

		$css_value = array_search( $option_key, $value_map, true );

		return false === $css_value ? null : (string) $css_value;
	}

	/**
	 * @return array<string, string>|null
	 */
	private static function invert_dictionary( array $dictionary ): ?array {
		$value_map = [];

		foreach ( $dictionary as $option_key => $css_value ) {
			if ( ! is_string( $css_value ) || false !== strpos( $css_value, self::DECLARATION_SEPARATOR ) ) {
				return null;
			}

			if ( '' === trim( $css_value ) ) {
				continue;
			}

			$value_map[ strtolower( trim( $css_value ) ) ] = (string) $option_key;
		}

		return empty( $value_map ) ? null : $value_map;
	}

	private static function are_option_keys( array $keys, array $options ): bool {
		foreach ( $keys as $key ) {
			if ( ! is_string( $key ) || ! array_key_exists( $key, $options ) ) {
				return false;
			}
		}

		return ! empty( $keys );
	}

	/**
	 * @param array<string, string> $css_values
	 * @return array<string, string>
	 */
	private static function normalize_keys( array $css_values ): array {
		$value_map = [];

		foreach ( $css_values as $css_value => $option_key ) {
			$value_map[ strtolower( trim( (string) $css_value ) ) ] = $option_key;
		}

		return $value_map;
	}
}
