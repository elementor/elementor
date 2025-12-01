<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Css_Variable_Aware_Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Color_Atomic_Property_Mapper_Base extends Atomic_Property_Mapper_Base {

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! $this->should_process_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || empty( trim( $value ) ) ) {
			return null;
		}

		$color_value = $this->parse_color_value( $value );
		if ( null === $color_value ) {
			return null;
		}

		return $this->generate_atomic_prop_type( $property, $color_value );
	}

	protected function should_process_property( string $property ): bool {
		return true;
	}

	abstract protected function generate_atomic_prop_type( string $property, string $color_value ): ?array;

	protected function create_color_prop_type( string $color_value ): array {
		return Css_Variable_Aware_Color_Prop_Type::make()->generate( $color_value );
	}

	private function is_valid_color_format( string $value ): bool {
		if ( str_starts_with( $value, 'var(' ) ) {
			return true;
		}

		if ( str_starts_with( $value, '#' ) && ( strlen( $value ) === 4 || strlen( $value ) === 7 ) ) {
			return ctype_xdigit( substr( $value, 1 ) );
		}

		if ( str_starts_with( $value, 'rgb' ) || str_starts_with( $value, 'hsl' ) ) {
			return true;
		}

		return in_array( strtolower( $value ), $this->get_named_colors(), true );
	}

	private function get_named_colors(): array {
		return [
			'transparent',
			'inherit',
			'initial',
			'unset',
			'black',
			'white',
			'red',
			'green',
			'blue',
			'yellow',
			'cyan',
			'magenta',
			'gray',
			'grey',
			'orange',
			'purple',
			'pink',
			'brown',
			'navy',
			'teal',
			'lime',
			'olive',
			'maroon',
			'silver',
			'aqua',
			'fuchsia',
			'gold',
			'violet',
		];
	}

	protected function parse_color_value( string $value ): ?string {
		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( 'transparent' === $value ) {
			return 'rgba(0,0,0,0)';
		}

		if ( $this->is_valid_color_format( $value ) ) {
			return $value;
		}

		return null;
	}
}
