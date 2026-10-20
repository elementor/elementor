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

		if ( ! is_string( $value ) ) {
			return null;
		}

		$family = self::single_family( $value );

		return '' !== $family ? $family : null;
	}

	/**
	 * V3 font controls hold one bare family name. The CSS the agent reads back quotes names with
	 * spaces, so quotes are stripped and a stack is reduced to its first family; otherwise a
	 * read-then-write stores the quotes and the rendered declaration becomes invalid.
	 */
	private static function single_family( string $value ): string {
		$first = trim( explode( ',', $value, 2 )[0] );

		if ( strlen( $first ) >= 2 && in_array( $first[0], [ '"', "'" ], true ) && substr( $first, -1 ) === $first[0] ) {
			$first = substr( $first, 1, -1 );
		}

		return trim( $first );
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		return is_string( $control_value ) && '' !== $control_value
			? Font_Family_Prop_Type::generate( $control_value )
			: null;
	}
}
