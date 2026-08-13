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
	public static function extract_input( $value, ?string $property ): ?array {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$name = $value['name'] ?? null;
		if ( is_string( $name ) && '' !== $name ) {
			$settings = $value['settings'] ?? [];
			if ( ! is_array( $settings ) ) {
				$settings = [];
			}

			return [
				'name' => $name,
				'settings' => $settings,
			];
		}

		if ( ! is_string( $property ) || '' === $property ) {
			return null;
		}

		$nested = $value[ $property ] ?? null;
		if ( ! is_array( $nested ) ) {
			return null;
		}

		$nested_name = $nested['name'] ?? null;
		if ( ! is_string( $nested_name ) || '' === $nested_name ) {
			return null;
		}

		$settings = $nested['settings'] ?? [];
		if ( ! is_array( $settings ) ) {
			$settings = [];
		}

		return [
			'name' => $nested_name,
			'settings' => $settings,
		];
	}
}
