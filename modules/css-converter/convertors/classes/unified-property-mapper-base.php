<?php
namespace Elementor\Modules\CssConverter\Convertors\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Unified_Property_Mapper_Base implements Unified_Property_Mapper_Interface {

	public function supports_v4_conversion( string $property, $value ): bool {
		return $this->supports( $property, $value );
	}

	public function get_v4_property_name( string $css_property ): string {
		return $css_property;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_v4_conversion( $property, $value ) ) {
			return null;
		}

		$class_format = $this->map_to_schema( $property, $value );

		if ( empty( $class_format ) ) {
			return null;
		}

		$v4_property = $this->get_v4_property_name( $property );
		$first_key = array_key_first( $class_format );
		$value_data = $class_format[ $first_key ];

		return [
			'property' => $v4_property,
			'value' => $value_data,
		];
	}
}
