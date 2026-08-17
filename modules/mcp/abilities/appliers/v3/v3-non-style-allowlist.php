<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates V3 element_config settings against keys derived from the widget controls stack.
 */
class V3_Non_Style_Allowlist {

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls Optional widget controls stack; resolved from config when omitted.
	 * @return array{allowed: array<string, mixed>, rejected: string[], error: \WP_Error|null}
	 */
	public static function filter( string $widget_type, array $settings, array $controls = [] ): array {
		if ( empty( $controls ) ) {
			$config = Widget_Context_Helper::get_widget_config( $widget_type );
			$controls = is_array( $config['controls'] ?? null ) ? $config['controls'] : [];
		}

		$allowed_keys = V3_Allowed_Setting_Keys::from_controls( $controls );
		$allowed_lookup = array_fill_keys( $allowed_keys, true );

		$allowed = [];
		$rejected = [];

		foreach ( $settings as $key => $value ) {
			if ( ! is_string( $key ) || '' === $key ) {
				continue;
			}

			if ( ! isset( $allowed_lookup[ $key ] ) ) {
				$rejected[] = $key;
				continue;
			}

			$allowed[ $key ] = $value;
		}

		if ( empty( $rejected ) ) {
			return [
				'allowed' => $allowed,
				'rejected' => [],
				'error' => null,
			];
		}

		$available = empty( $allowed_keys )
			? '(none — this V3 widget has no settable keys in element_config)'
			: implode( ', ', $allowed_keys );

		return [
			'allowed' => $allowed,
			'rejected' => $rejected,
			'error' => new \WP_Error(
				'elementor_invalid_settings',
				sprintf(
					'V3 widget "%s" does not allow settings: %s. Allowed keys: %s. Use elementor/get-widget-schema for the full list.',
					$widget_type,
					implode( ', ', $rejected ),
					$available
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			),
		];
	}
}
