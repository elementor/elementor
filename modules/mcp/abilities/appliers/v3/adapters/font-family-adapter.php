<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Font_Family_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Font_Family_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'font';

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return Font_Family_Prop_Type::get_key() === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$value = $prop_value['value'] ?? null;

		return is_string( $value ) && '' !== $value ? $value : null;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		return is_string( $control_value ) && '' !== $control_value
			? Font_Family_Prop_Type::generate( $control_value )
			: null;
	}
}
