<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Controls_Metadata {

	const LAYOUT_CONTROL_TYPES = [ 'section', 'tab', 'tabs' ];

	/**
	 * @param mixed       $controls     Widget controls stack.
	 * @param string[]|null $allowed_keys When provided, only these control keys are emitted.
	 */
	public static function extract( $controls, ?array $allowed_keys = null ): array {
		if ( ! is_array( $controls ) || empty( $controls ) ) {
			return [];
		}

		$allowed_lookup = null === $allowed_keys
			? null
			: array_fill_keys( $allowed_keys, true );

		$result = [];

		foreach ( $controls as $control_key => $control ) {
			if ( ! is_array( $control ) ) {
				continue;
			}

			if ( null !== $allowed_lookup && ! isset( $allowed_lookup[ $control_key ] ) ) {
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
