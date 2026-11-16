<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Link_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'url';

	const FLAG_ON = 'on';

	const FLAG_OFF = '';

	const FLAG_KEYS = [ 'is_external', 'nofollow' ];

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return V3_Link_Prop_Type::make();
	}

	public function to_control_value( array $prop_value, array $control ) {
		$fields = $prop_value['value'] ?? [];
		$stored = [ 'url' => (string) ( $fields['url']['value'] ?? '' ) ];

		foreach ( self::FLAG_KEYS as $flag ) {
			$stored[ $flag ] = true === ( $fields[ $flag ]['value'] ?? null ) ? self::FLAG_ON : self::FLAG_OFF;
		}

		return $stored;
	}

	public function from_control_value( $stored, array $control ) {
		if ( ! is_array( $stored ) ) {
			return null;
		}

		$plain = [ 'url' => (string) ( $stored['url'] ?? '' ) ];

		foreach ( self::FLAG_KEYS as $flag ) {
			$plain[ $flag ] = self::FLAG_ON === ( $stored[ $flag ] ?? null );
		}

		return $plain;
	}
}
