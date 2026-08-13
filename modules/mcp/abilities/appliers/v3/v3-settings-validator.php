<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Value-level gate for V3 element_config entries. Composes two concerns:
 *
 *   1. `V3_Non_Style_Allowlist` — key gate (which keys the widget accepts at all).
 *   2. Shape check              — validates values against the JSON Schema entry
 *                                 emitted by `V3_Json_Schema_Builder`, so the applier
 *                                 never merges an array into a scalar field (the
 *                                 original bug: `link` merged as `{name, settings}`
 *                                 and `esc_url()` blew up on the array at render).
 *
 * Shape check is intentionally shallow (one level): V3 has no runtime `Props_Parser`,
 * and one level catches the array-vs-scalar and unknown-enum classes of bugs without
 * inventing a general JSON-Schema validator.
 */
class V3_Settings_Validator {

	/**
	 * @param string               $widget_type   V3 widget type (e.g. `theme-post-title`).
	 * @param array<string, mixed> $settings      Raw settings for a single element_config entry.
	 * @param array<string, mixed> $widget_config Widget config from `Widget_Type_Resolver::resolve_type_config()`.
	 *
	 * @return array{
	 *     allowed: array<string, mixed>,
	 *     error: \WP_Error|null,
	 * }
	 */
	public static function validate( string $widget_type, array $settings, array $widget_config ): array {
		$key_filter = V3_Non_Style_Allowlist::filter( $widget_type, $settings );

		$errors = [];
		if ( $key_filter['error'] ) {
			$errors[] = $key_filter['error']->get_error_message();
		}

		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$schema = V3_Json_Schema_Builder::build( $controls, array_keys( $key_filter['allowed'] ) );

		$allowed = [];

		foreach ( $key_filter['allowed'] as $key => $value ) {
			$shape_error = self::validate_primitive( $value, $schema['properties'][ $key ] ?? null );

			if ( null !== $shape_error ) {
				$errors[] = self::format_error( $widget_type, $key, $shape_error );
				continue;
			}

			$allowed[ $key ] = $value;
		}

		return [
			'allowed' => $allowed,
			'error' => empty( $errors ) ? null : new \WP_Error(
				'elementor_invalid_settings',
				implode( '; ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			),
		];
	}

	private static function format_error( string $widget_type, string $key, string $reason ): string {
		return sprintf( 'V3 widget "%s" property "%s": %s', $widget_type, $key, $reason );
	}

	private static function validate_primitive( $value, ?array $entry_schema ): ?string {
		if ( ! is_array( $entry_schema ) ) {
			return null;
		}

		$expected_type = $entry_schema['type'] ?? null;
		$actual_type = self::json_type_of( $value );

		if ( $expected_type && $expected_type !== $actual_type ) {
			return sprintf( 'invalid shape (expected %s, got %s).', $expected_type, $actual_type );
		}

		if ( isset( $entry_schema['enum'] ) && is_array( $entry_schema['enum'] ) && ! in_array( $value, $entry_schema['enum'], true ) ) {
			return sprintf( 'value must be one of [%s].', implode( ', ', array_map( 'strval', $entry_schema['enum'] ) ) );
		}

		if ( 'object' === $expected_type && is_array( $value ) && isset( $entry_schema['properties'] ) && is_array( $entry_schema['properties'] ) ) {
			foreach ( $entry_schema['properties'] as $prop_key => $prop_schema ) {
				if ( ! is_string( $prop_key ) || ! array_key_exists( $prop_key, $value ) ) {
					continue;
				}

				$sub_expected = $prop_schema['type'] ?? null;
				$sub_actual = self::json_type_of( $value[ $prop_key ] );
				if ( $sub_expected && $sub_expected !== $sub_actual ) {
					return sprintf( 'invalid shape at "%s" (expected %s, got %s).', $prop_key, $sub_expected, $sub_actual );
				}
			}
		}

		return null;
	}

	private static function json_type_of( $value ): string {
		if ( is_string( $value ) ) {
			return 'string';
		}
		if ( is_bool( $value ) ) {
			return 'boolean';
		}
		if ( is_int( $value ) || is_float( $value ) ) {
			return 'number';
		}
		if ( null === $value ) {
			return 'null';
		}
		if ( is_array( $value ) ) {
			if ( empty( $value ) ) {
				return 'object';
			}
			return array_keys( $value ) === range( 0, count( $value ) - 1 ) ? 'array' : 'object';
		}
		return gettype( $value );
	}
}
