<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shallow shape guard for the primitive remainder of a V3 element_config entry.
 *
 * Called after `V3_Non_Style_Allowlist` (key gate) and `V3_Dynamic_Hoister`
 * (splits dynamic shortcodes from primitives). Delegates to
 * `V3_Json_Schema_Builder::check_settings_shape()` — enforces only `type`,
 * `enum`, and one-level nested `properties.type` so the applier never merges
 * an array into a scalar field.
 */
class V3_Settings_Validator {

	/**
	 * @param string               $widget_type   V3 widget type (e.g. `theme-post-title`).
	 * @param array<string, mixed> $primitives    Primitive settings (after hoisting removed __dynamic__ entries).
	 * @param array<string, mixed> $widget_config Widget config from `Widget_Type_Resolver::resolve_type_config()`.
	 *
	 * @return array{
	 *     valid: array<string, mixed>,
	 *     error: \WP_Error|null,
	 * }
	 */
	public static function validate_shape( string $widget_type, array $primitives, array $widget_config ): array {
		$contract = V3_Widget_Map_Registry::instance()->get_validation_contract( $widget_type );
		$is_standardized = V3_Widget_Map_Registry::instance()->is_experiment_active() && null !== $contract;

		if ( $is_standardized ) {
			$schema = V3_Json_Schema_Builder::build_from_map( $contract['settings'] );
		} else {
			$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
			$schema = V3_Json_Schema_Builder::build( $controls, array_keys( $primitives ) );
		}

		$shape = V3_Json_Schema_Builder::check_settings_shape( $primitives, $schema );

		if ( empty( $shape['errors'] ) ) {
			return [
				'valid' => $is_standardized ? self::resolve_map_settings( $shape['valid'], $contract['settings'] ) : $shape['valid'],
				'error' => null,
			];
		}

		$messages = [];
		foreach ( $shape['errors'] as $key => $reason ) {
			$messages[] = sprintf( 'V3 widget "%s" property "%s": %s', $widget_type, $key, $reason );
		}

		return [
			'valid' => $is_standardized ? self::resolve_map_settings( $shape['valid'], $contract['settings'] ) : $shape['valid'],
			'error' => new \WP_Error(
				'elementor_invalid_settings',
				implode( '; ', $messages ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			),
		];
	}

	/**
	 * @param array<string, mixed>                $settings
	 * @param array<string, array<string, mixed>> $schemas
	 * @return array<string, mixed>
	 */
	private static function resolve_map_settings( array $settings, array $schemas ): array {
		$resolved = [];

		foreach ( $settings as $public_key => $value ) {
			$schema = $schemas[ $public_key ] ?? [];
			$control_key = $schema['key'] ?? $public_key;

			$resolved[ $control_key ] = self::convert_map_value( $value, $schema );
		}

		return $resolved;
	}

	private static function convert_map_value( $value, array $schema ) {
		$convert = $schema['convert'] ?? null;

		if ( is_array( $convert ) ) {
			$conversion_key = is_bool( $value ) ? ( $value ? 'true' : 'false' ) : (string) $value;

			if ( array_key_exists( $conversion_key, $convert ) ) {
				return $convert[ $conversion_key ];
			}
		}

		if ( is_array( $value ) && is_array( $schema['properties'] ?? null ) ) {
			foreach ( $value as $key => $nested_value ) {
				$nested_schema = $schema['properties'][ $key ] ?? null;

				if ( is_array( $nested_schema ) ) {
					$value[ $key ] = self::convert_map_value( $nested_value, $nested_schema );
				}
			}
		}

		return $value;
	}
}
