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

	private bool $whole;

	public function __construct( bool $whole = false ) {
		$this->whole = $whole;
	}

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		$prop_type = V3_Number_Prop_Type::make()->range(
			self::control_limit( $control, 'min' ),
			self::control_limit( $control, 'max' )
		);

		return $this->whole || self::has_whole_step( $control ) ? $prop_type->whole() : $prop_type;
	}

	/**
	 * @param array<string, mixed> $control
	 * @param string               $key
	 * @return int|float|null
	 */
	private static function control_limit( array $control, string $key ) {
		return is_numeric( $control[ $key ] ?? null ) ? +$control[ $key ] : null;
	}

	private static function has_whole_step( array $control ): bool {
		$step = self::control_limit( $control, 'step' );

		return null !== $step && floor( (float) $step ) === (float) $step;
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
