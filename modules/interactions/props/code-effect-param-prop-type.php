<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Code_Effect_Param_Prop_Type extends Object_Prop_Type {
	const KEY_PATTERN = '/^[a-zA-Z_][a-zA-Z0-9_]{0,31}$/';

	const CONTROL_VALUE_TYPES = [
		'number' => 'number',
		'slider' => 'number',
		'text' => 'string',
		'select' => 'string',
		'color' => 'color',
		'switch' => 'boolean',
	];

	public static function get_key(): string {
		return 'code-effect-param';
	}

	public static function controls(): array {
		return array_keys( self::CONTROL_VALUE_TYPES );
	}

	protected function define_shape(): array {
		return [
			'key' => String_Prop_Type::make()
				->regex( self::KEY_PATTERN )
				->required()
				->description( 'Identifier read by the code as params.<key>' ),
			'label' => String_Prop_Type::make()
				->required()
				->description( 'Field label shown in the Interactions tab' ),
			'control' => String_Prop_Type::make()
				->enum( self::controls() )
				->required()
				->description( 'Field control. number/slider hold numbers, text/select hold strings, color holds a color, switch holds a boolean' ),
			'value' => self::make_value_prop_type()->description( 'Current value passed to the code' ),
			'default' => self::make_value_prop_type()->description( 'Value restored when the user resets the field' ),
			'min' => Number_Prop_Type::make()->float()->description( 'Minimum for number/slider controls' ),
			'max' => Number_Prop_Type::make()->float()->description( 'Maximum for number/slider controls' ),
			'step' => Number_Prop_Type::make()->float()->description( 'Step for number/slider controls' ),
			'options' => String_Array_Prop_Type::make()->description( 'Allowed values for select controls' ),
		];
	}

	private static function make_value_prop_type(): Union_Prop_Type {
		return Union_Prop_Type::make()
			->add_prop_type( Number_Prop_Type::make()->float() )
			->add_prop_type( String_Prop_Type::make() )
			->add_prop_type( Color_Prop_Type::make() )
			->add_prop_type( Boolean_Prop_Type::make() );
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$expected_type = self::CONTROL_VALUE_TYPES[ $value['control']['value'] ];

		foreach ( [ 'value', 'default' ] as $field ) {
			if ( ! isset( $value[ $field ] ) ) {
				continue;
			}

			if ( $expected_type !== $value[ $field ]['$$type'] ) {
				return false;
			}

			if ( 'number' === $expected_type && ! $this->is_within_range( $value, (float) $value[ $field ]['value'] ) ) {
				return false;
			}

			if ( 'select' === $value['control']['value'] && ! $this->is_allowed_option( $value, $value[ $field ]['value'] ) ) {
				return false;
			}
		}

		return true;
	}

	private function is_within_range( array $value, float $number ): bool {
		$min = isset( $value['min'] ) ? (float) $value['min']['value'] : null;
		$max = isset( $value['max'] ) ? (float) $value['max']['value'] : null;

		return ( null === $min || $number >= $min ) && ( null === $max || $number <= $max );
	}

	private function is_allowed_option( array $value, string $option ): bool {
		$options = array_map(
			fn( $item ) => $item['value'] ?? null,
			$value['options']['value'] ?? []
		);

		return in_array( $option, $options, true );
	}
}
