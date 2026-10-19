<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icons_Setting_Adapter implements V3_Setting_Adapter, V3_Plain_Value_Guard {

	const CONTROL_TYPE = 'icons';

	const FIELD_KEYS = [ 'value', 'library' ];

	/**
	 * The icon value becomes a CSS class list and an icon-library lookup; only class-name characters make sense.
	 */
	public function reject_reason( $plain, array $control ): ?string {
		if ( ! is_array( $plain ) || ( $plain === array_values( $plain ) ) ) {
			return 'is not an icon object ({ value, library })';
		}

		foreach ( self::FIELD_KEYS as $key ) {
			$value = $plain[ $key ] ?? '';

			if ( ! is_string( $value ) || ! preg_match( '/^[A-Za-z0-9 _-]*$/', $value ) ) {
				return sprintf( 'has an icon "%s" with unsupported characters (letters, digits, spaces, "-" and "_" only)', $key );
			}
		}

		$unknown = array_diff( array_keys( $plain ), self::FIELD_KEYS );

		return empty( $unknown ) ? null : sprintf( 'has unsupported icon keys (%s)', implode( ', ', $unknown ) );
	}

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return V3_Icons_Prop_Type::make();
	}

	public function to_control_value( array $prop_value, array $control ) {
		$fields = $prop_value['value'] ?? [];
		$stored = [];

		foreach ( self::FIELD_KEYS as $key ) {
			$stored[ $key ] = (string) ( $fields[ $key ]['value'] ?? '' );
		}

		return $stored;
	}

	public function from_control_value( $stored, array $control ) {
		if ( ! is_array( $stored ) ) {
			return null;
		}

		$plain = [];

		foreach ( self::FIELD_KEYS as $key ) {
			$plain[ $key ] = is_scalar( $stored[ $key ] ?? null ) ? (string) $stored[ $key ] : '';
		}

		return $plain;
	}
}
