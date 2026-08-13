<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Value-level gate for V3 element_config entries. Composes:
 *
 *   1. `V3_Non_Style_Allowlist` — key gate (which keys the widget accepts at all).
 *   2. Shallow shape check — `V3_Json_Schema_Builder::check_settings_shape()` against the
 *      schema emitted by `build()`, so the applier never merges an array into a scalar field.
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

		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$schema = V3_Json_Schema_Builder::build( $controls, array_keys( $key_filter['allowed'] ) );
		$shape = V3_Json_Schema_Builder::check_settings_shape( $key_filter['allowed'], $schema );

		$errors = [];

		if ( $key_filter['error'] ) {
			$errors[] = $key_filter['error']->get_error_message();
		}

		foreach ( $shape['errors'] as $key => $reason ) {
			$errors[] = sprintf( 'V3 widget "%s" property "%s": %s', $widget_type, $key, $reason );
		}

		return [
			'allowed' => $shape['valid'],
			'error' => empty( $errors ) ? null : new \WP_Error(
				'elementor_invalid_settings',
				implode( '; ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			),
		];
	}
}
