<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Controls_Metadata {

	const LAYOUT_CONTROL_TYPES = [ 'section', 'tab', 'tabs' ];

	public static function extract( $controls ): array {
		if ( ! is_array( $controls ) || empty( $controls ) ) {
			return [];
		}

		$result = [];

		foreach ( $controls as $control_key => $control ) {
			if ( ! is_array( $control ) ) {
				continue;
			}

			$control_type = is_string( $control['type'] ?? null ) ? $control['type'] : null;

			if ( $control_type && in_array( $control_type, self::LAYOUT_CONTROL_TYPES, true ) ) {
				continue;
			}

			$result[ $control_key ] = self::build_entry( $control, $control_type );
		}

		return $result;
	}

	private static function build_entry( array $control, ?string $control_type ): array {
		$entry = [];

		if ( array_key_exists( 'default', $control ) ) {
			$entry['default'] = $control['default'];
		}

		if ( $control_type ) {
			$entry['type'] = $control_type;
		}

		if ( isset( $control['options'] ) ) {
			$options = $control['options'];
			$entry['options'] = ( is_array( $options ) && self::is_associative_array( $options ) )
				? array_keys( $options )
				: $options;
		}

		return $entry;
	}

	private static function is_associative_array( array $arr ): bool {
		return array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
	}
}
