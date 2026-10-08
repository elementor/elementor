<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Enum_From_Control_Setting_Adapter implements V3_Setting_Adapter {

	const CHOICE_CONTROL_TYPES = [ 'select', 'select2', 'choose' ];

	public function supports( array $control ): bool {
		return in_array( $control['type'] ?? null, self::CHOICE_CONTROL_TYPES, true )
			&& ! empty( $control['options'] )
			&& is_array( $control['options'] );
	}

	public function prop_type( array $control ): Prop_Type {
		return String_Prop_Type::make()->enum( self::option_values( $control ) );
	}

	public function to_control_value( array $prop_value, array $control ) {
		return $prop_value['value'] ?? null;
	}

	public function from_control_value( $stored, array $control ) {
		return is_scalar( $stored ) ? (string) $stored : null;
	}

	/**
	 * @param array<string, mixed> $control
	 * @return string[]
	 */
	private static function option_values( array $control ): array {
		return array_map( 'strval', array_keys( $control['options'] ?? [] ) );
	}
}
