<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class String_Choice_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPES = [ 'select', 'choose', 'text' ];

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return String_Prop_Type::get_key() === $prop_type && in_array( $control_type, self::CONTROL_TYPES, true ) && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$value = $prop_value['value'] ?? null;

		if ( ! is_string( $value ) || '' === $value ) {
			return null;
		}

		return $this->is_listed_option( $value, $control ) ? $value : null;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		if ( ! is_scalar( $control_value ) || '' === (string) $control_value ) {
			return null;
		}

		return String_Prop_Type::generate( (string) $control_value );
	}

	private function is_listed_option( string $value, array $control ): bool {
		$options = $control['options'] ?? null;

		return ! is_array( $options ) || empty( $options ) || array_key_exists( $value, $options );
	}
}
