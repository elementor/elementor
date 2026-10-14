<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\Editor_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates V3 element_config settings against the per-widget non-style allowlist.
 */
class V3_Non_Style_Allowlist {

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $settings
	 * @return array{allowed: array<string, mixed>, rejected: string[], error: \WP_Error|null}
	 */
	public static function filter( string $widget_type, array $settings ): array {
		$map = V3_Widget_Map_Registry::instance()->get_map( $widget_type );
		$allowed_keys = null !== $map
			? array_keys( $map->get_settings() )
			: V3_Widget_Bridge_Registry::get_non_style_keys( $widget_type );
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
			? '(none — this V3 widget has no settable behavior keys; use style for visuals)'
			: implode( ', ', $allowed_keys );

		return [
			'allowed' => $allowed,
			'rejected' => $rejected,
			'error' => new \WP_Error(
				'elementor_invalid_settings',
				sprintf(
					'V3 widget "%s" does not allow settings: %s. Allowed non-style keys: %s. Visual styling must go through the style (CSS) input.%s',
					$widget_type,
					implode( ', ', $rejected ),
					$available,
					self::get_editor_settings_hint( $rejected )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			),
		];
	}

	private static function get_editor_settings_hint( array $rejected ): string {
		$editor_keys = array_values( array_filter( $rejected, [ Editor_Settings::class, 'is_editor_key' ] ) );

		if ( empty( $editor_keys ) ) {
			return '';
		}

		return sprintf( ' %s: editor-only, send in `editor_settings` instead.', implode( ', ', $editor_keys ) );
	}
}
