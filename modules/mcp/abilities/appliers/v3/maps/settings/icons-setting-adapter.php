<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icons_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'icons';

	const FIELD_KEYS = [ 'value', 'library' ];

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
