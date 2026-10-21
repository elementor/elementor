<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Number_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'number';

	/**
	 * Largest magnitude that a float and a stored integer both represent exactly.
	 */
	const MAX_MAGNITUDE = 9007199254740992;

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return V3_Number_Prop_Type::make()->range(
			self::control_limit( $control, 'min', -self::MAX_MAGNITUDE ),
			self::control_limit( $control, 'max', self::MAX_MAGNITUDE )
		);
	}

	/**
	 * @param array<string, mixed> $control
	 * @param string               $key
	 * @param int                  $fallback
	 * @return int|float
	 */
	private static function control_limit( array $control, string $key, int $fallback ) {
		return is_numeric( $control[ $key ] ?? null ) ? +$control[ $key ] : $fallback;
	}

	public function to_control_value( array $prop_value, array $control ) {
		$value = $prop_value['value'] ?? null;

		if ( ! is_numeric( $value ) ) {
			return null;
		}

		// The prop type sanitizes to float; whole numbers are stored as integers, like the editor does.
		return floor( (float) $value ) === (float) $value && abs( (float) $value ) <= self::MAX_MAGNITUDE ? (int) $value : (float) $value;
	}

	public function from_control_value( $stored, array $control ) {
		return is_numeric( $stored ) ? +$stored : null;
	}
}
