<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Property_Mapper_Base implements Property_Mapper_Interface {
	
	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	protected function create_v4_property( string $property, $value ): array {
		return [
			'$$type' => 'string',
			'value' => (string) $value
		];
	}

	protected function create_v4_property_with_type( string $property, string $type, $value ): array {
		return [
			'$$type' => $type,
			'value' => $value
		];
	}

	protected function parse_size_value( string $value ): array {
		$value = trim( $value );
		
		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			
			return [
				'size' => $size,
				'unit' => strtolower( $unit )
			];
		}
		
		return [
			'size' => 0.0,
			'unit' => 'px'
		];
	}

	protected function parse_color_value( string $value ): string {
		$value = trim( $value );
		
		// Basic color validation - just return as-is for now
		return $value;
	}

	protected function is_valid_css_value( $value ): bool {
		return is_string( $value ) && ! empty( trim( $value ) );
	}

	abstract public function get_supported_properties(): array;
	abstract public function map_to_v4_atomic( string $property, $value ): ?array;
}
