<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Detects LLM-facing dynamic-tag input shapes on V3 widget controls.
 */
class V3_Dynamic_Resolver {

	public static function is_dynamic_capable( array $control ): bool {
		$control_dynamic = is_array( $control['dynamic'] ?? null ) ? $control['dynamic'] : [];

		if ( true === ( $control_dynamic['active'] ?? false ) ) {
			return true;
		}

		return is_string( $control_dynamic['default'] ?? null ) && '' !== $control_dynamic['default'];
	}

	/**
	 * @return array{name: string, settings: array<string, mixed>}|null
	 */
	public static function contains_dynamic_input( $value, ?string $property = null ): bool {
		return null !== self::extract_input( $value, $property );
	}

	/**
	 * @param mixed $value
	 */
	public static function contains_nested_dynamic_input( $value ): bool {
		if ( self::contains_dynamic_input( $value, null ) ) {
			return true;
		}

		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $value as $nested_value ) {
			if ( self::contains_dynamic_input( $nested_value, null ) ) {
				return true;
			}
		}

		return false;
	}

	public static function extract_input( $value, ?string $property ): ?array {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$top_level = self::normalize_dynamic_input( $value );
		if ( null !== $top_level ) {
			return $top_level;
		}

		if ( ! is_string( $property ) || '' === $property ) {
			return null;
		}

		$nested = $value[ $property ] ?? null;
		if ( ! is_array( $nested ) ) {
			return null;
		}

		return self::normalize_dynamic_input( $nested );
	}

	/**
	 * @param array<string, mixed> $value
	 *
	 * @return array<string, mixed>
	 */
	public static function extract_primitive_remainder( array $value, ?string $property ): array {
		if ( ! is_string( $property ) || '' === $property || ! array_key_exists( $property, $value ) ) {
			return [];
		}

		$remainder = $value;
		unset( $remainder[ $property ] );

		return $remainder;
	}

	/**
	 * @return array{name: string, settings: array<string, mixed>}|null
	 */
	private static function normalize_dynamic_input( array $candidate ): ?array {
		$name = $candidate['name'] ?? null;
		if ( ! is_string( $name ) || '' === $name ) {
			return null;
		}

		$settings = $candidate['settings'] ?? [];
		if ( ! is_array( $settings ) ) {
			$settings = [];
		}

		return [
			'name' => $name,
			'settings' => $settings,
		];
	}
}
