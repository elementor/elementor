<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

abstract class Abstract_Css_Property_Convertor implements Property_Mapper_Interface {
	
	abstract public function map_to_schema( string $property, $value ): array;
	
	abstract public function map_to_v4_atomic( string $property, $value ): ?array;

	protected function create_v4_property( string $property_name, $value ): array {
		return [
			$property_name => [
				'$$type' => $this->get_v4_type( $value ),
				'value' => $value,
			],
		];
	}

	protected function get_v4_type( $value ): string {
		if ( is_string( $value ) ) {
			return 'string';
		}
		if ( is_numeric( $value ) ) {
			return 'number';
		}
		if ( is_bool( $value ) ) {
			return 'boolean';
		}
		if ( is_array( $value ) ) {
			return 'object';
		}
		return 'string';
	}

	protected function normalize_css_value( $value ): string {
		if ( is_array( $value ) ) {
			return implode( ' ', $value );
		}
		return (string) $value;
	}
}
