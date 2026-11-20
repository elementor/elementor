<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Number_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'number';

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return Number_Prop_Type::get_key() === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$value = $prop_value['value'] ?? null;

		return is_numeric( $value ) ? $value + 0 : null;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		return is_numeric( $control_value ) ? Number_Prop_Type::generate( $control_value + 0 ) : null;
	}
}
