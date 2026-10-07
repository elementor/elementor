<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Slider_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'slider';

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return Size_Prop_Type::get_key() === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$size = Size_Values::from_prop( $prop_value );

		return null !== $size && Size_Values::is_unit_allowed( $size, $control ) ? $size : null;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		return Size_Values::to_prop( $control_value );
	}
}
