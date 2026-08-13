<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Value-level gate for V3 element_config entries. Composes three concerns:
 *
 *   1. `V3_Non_Style_Allowlist`  — key gate (which keys the widget accepts at all).
 *   2. `V3_Dynamic_Resolver`     — routes `{ name, settings }` (or its nested variant on
 *                                  URL/media controls) into `__dynamic__[key]` shortcodes
 *                                  so the LLM cannot smuggle a V4-shaped dynamic into a
 *                                  V3 primitive slot.
 *   3. Shape check               — validates remaining primitive values against the JSON
 *                                  Schema entry emitted by `V3_Json_Schema_Builder` so
 *                                  the applier never merges an array into a scalar field
 *                                  (the original bug: `link` merged as `{name, settings}`
 *                                  and `esc_url()` blew up on the array).
 */
class V3_Settings_Validator {

	/**
	 * @param string               $widget_type   V3 widget type (e.g. `theme-post-title`).
	 * @param array<string, mixed> $settings      Raw settings for a single element_config entry.
	 * @param array<string, mixed> $widget_config Widget config from `Widget_Type_Resolver::resolve_type_config()`.
	 *
	 * @return array{
	 *     allowed: array<string, mixed>,
	 *     dynamic_patch: array<string, string>,
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
		$dynamic_patch = [];

		foreach ( $key_filter['allowed'] as $key => $value ) {
			$control = is_array( $controls[ $key ] ?? null ) ? $controls[ $key ] : [];

			$dynamic_outcome = V3_Dynamic_Resolver::try_resolve( $key, $value, $control );
			if ( $dynamic_outcome['matched'] ) {
				if ( isset( $dynamic_outcome['error'] ) ) {
					$errors[] = self::format_error( $widget_type, $key, $dynamic_outcome['error']->get_error_message() );
					continue;
				}

				$dynamic_patch[ $key ] = $dynamic_outcome['shortcode'];
				$allowed[ $key ] = $dynamic_outcome['primitive'];
				continue;
			}

			$shape_error = self::validate_primitive( $value, $schema['properties'][ $key ] ?? null );
			if ( null !== $shape_error ) {
				$errors[] = self::format_error( $widget_type, $key, $shape_error );
				continue;
			}

			$allowed[ $key ] = $value;
		}

		return [
			'allowed' => $allowed,
			'dynamic_patch' => $dynamic_patch,
			'error' => empty( $errors ) ? null : new \WP_Error(
				'elementor_invalid_settings',
				implode( ' ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			),
		];
	}

	private static function format_error( string $widget_type, string $key, string $reason ): string {
		return sprintf( 'V3 widget "%s" property "%s": %s', $widget_type, $key, $reason );
	}

	/**
	 * Best-effort JSON-Schema shape check. Unlike `Props_Parser` (V4), V3 has no runtime
	 * parser, so we walk one level deep — enough to catch the array-vs-scalar and unknown
	 * enum-value classes of bugs, without inventing a general JSON-Schema validator.
	 */
	private static function validate_primitive( $value, ?array $entry_schema ): ?string {
		if ( ! is_array( $entry_schema ) ) {
			return null;
		}

		$primitive_schema = self::unwrap_primitive_branch( $entry_schema );

		return self::validate_against_schema( $value, $primitive_schema );
	}

	private static function unwrap_primitive_branch( array $entry_schema ): array {
		if ( ! isset( $entry_schema['anyOf'] ) || ! is_array( $entry_schema['anyOf'] ) ) {
			return $entry_schema;
		}

		foreach ( $entry_schema['anyOf'] as $branch ) {
			if ( is_array( $branch ) && ! self::is_dynamic_branch( $branch ) ) {
				return $branch;
			}
		}

		return $entry_schema;
	}

	private static function is_dynamic_branch( array $branch ): bool {
		if ( 'object' !== ( $branch['type'] ?? null ) ) {
			return false;
		}

		$required = $branch['required'] ?? [];
		if ( ! is_array( $required ) || ! in_array( 'name', $required, true ) ) {
			return false;
		}

		return isset( $branch['properties']['name'] );
	}

	private static function validate_against_schema( $value, array $schema ): ?string {
		$expected_type = $schema['type'] ?? null;
		$actual_type = self::json_type_of( $value );

		if ( $expected_type && $expected_type !== $actual_type ) {
			return sprintf( 'invalid shape (expected %s, got %s).', $expected_type, $actual_type );
		}

		if ( isset( $schema['enum'] ) && is_array( $schema['enum'] ) && ! in_array( $value, $schema['enum'], true ) ) {
			return sprintf( 'value must be one of [%s].', implode( ', ', array_map( 'strval', $schema['enum'] ) ) );
		}

		if ( 'object' === $expected_type && is_array( $value ) && isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			foreach ( $schema['properties'] as $prop_key => $prop_schema ) {
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
