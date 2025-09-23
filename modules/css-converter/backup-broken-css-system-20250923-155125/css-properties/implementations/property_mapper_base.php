<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

abstract class Property_Mapper_Base implements Property_Mapper_Interface {
	
	abstract public function supports( string $property, $value ): bool;
	
	abstract public function get_supported_properties(): array;
	
	abstract public function map_to_schema( string $property, $value ): array;
	
	abstract public function map_to_v4_atomic( string $property, $value ): ?array;

	protected function create_v4_property( string $property_name, $value ): array {
		return [
			'property' => $property_name,
			'value' => [
				'$$type' => $this->get_v4_type( $value ),
				'value' => $value,
			],
		];
	}

	protected function create_v4_property_with_type( string $property_name, string $type, $value ): array {
		return [
			'property' => $property_name,
			'value' => [
				'$$type' => $type,
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

	protected function is_valid_css_unit( string $value ): bool {
		return 1 === preg_match( '/^-?\d*\.?\d+(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/', trim( $value ) );
	}

	protected function extract_numeric_value( string $value ): float {
		preg_match( '/^(-?\d*\.?\d+)/', trim( $value ), $matches );
		return isset( $matches[1] ) ? (float) $matches[1] : 0.0;
	}

	protected function extract_css_unit( string $value ): string {
		preg_match( '/^-?\d*\.?\d+([a-z%]+)?$/i', trim( $value ), $matches );
		return isset( $matches[1] ) ? $matches[1] : 'px';
	}
}
