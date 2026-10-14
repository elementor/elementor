<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Number_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'number';

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return V3_Number_Prop_Type::make();
	}

	public function to_control_value( array $prop_value, array $control ) {
		$value = $prop_value['value'] ?? null;

		if ( ! is_numeric( $value ) ) {
			return null;
		}

		// The prop type sanitizes to float; whole numbers are stored as integers, like the editor does.
		return floor( (float) $value ) === (float) $value ? (int) $value : (float) $value;
	}

	public function from_control_value( $stored, array $control ) {
		return is_numeric( $stored ) ? +$stored : null;
	}
}
