<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

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
		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$schema = V3_Json_Schema_Builder::build( $controls, array_keys( $primitives ) );
		$shape = V3_Json_Schema_Builder::check_settings_shape( $primitives, $schema );

		if ( empty( $shape['errors'] ) ) {
			return [
				'valid' => $shape['valid'],
				'error' => null,
			];
		}

		$messages = [];
		foreach ( $shape['errors'] as $key => $reason ) {
			$messages[] = sprintf( 'V3 widget "%s" property "%s": %s', $widget_type, $key, $reason );
		}

		return [
			'valid' => $shape['valid'],
			'error' => new \WP_Error(
				'elementor_invalid_settings',
				implode( '; ', $messages ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			),
		];
	}
}
