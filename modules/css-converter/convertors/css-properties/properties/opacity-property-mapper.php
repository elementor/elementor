<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Opacity_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'opacity',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$opacity_data = $this->parse_opacity_value( $value );
		if ( null === $opacity_data ) {
			return null;
		}

		$size_prop_type = Size_Prop_Type::make()
			->units( Size_Constants::opacity() )
			->default_unit( Size_Constants::UNIT_PERCENT );

		$opacity_value = $size_prop_type->generate( $opacity_data );

		return [
			'property' => 'opacity',
			'value' => $opacity_value
		];
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_opacity_value( $value ): ?array {
		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return null;
		}

		$value = trim( (string) $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( str_ends_with( $value, '%' ) ) {
			$numeric_value = (float) rtrim( $value, '%' );
			return [
				'size' => $numeric_value,
				'unit' => '%'
			];
		}

		$numeric_value = (float) $value;

		if ( $numeric_value < 0 || $numeric_value > 1 ) {
			return null;
		}

		$percentage_value = $numeric_value * 100;

		return [
			'size' => $percentage_value,
			'unit' => '%'
		];
	}
}
