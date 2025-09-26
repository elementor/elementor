<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Font_Size_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['font-size'];

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_font_size_value( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		return $this->create_v4_property_with_type( 
			$property, 
			'size', 
			$parsed_value 
		);
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function supports_v4_conversion( string $property, $value ): bool {
		return $this->supports_property( $property ) && $this->is_valid_css_value( $value );
	}

	public function get_v4_property_name( string $property ): string {
		return $property;
	}

	// TODO: Replace with atomic widgets approach
	public function map_to_schema( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_font_size_value( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		return [
			$property => [
				'$$type' => 'size',
				'value' => $parsed_value
			]
		];
	}

	private function parse_font_size_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return null;
		}

		$named_sizes = [
			'xx-small' => ['size' => 9, 'unit' => 'px'],
			'x-small' => ['size' => 10, 'unit' => 'px'],
			'small' => ['size' => 13, 'unit' => 'px'],
			'medium' => ['size' => 16, 'unit' => 'px'],
			'large' => ['size' => 18, 'unit' => 'px'],
			'x-large' => ['size' => 24, 'unit' => 'px'],
			'xx-large' => ['size' => 32, 'unit' => 'px'],
		];

		$normalized = strtolower( $value );
		if ( isset( $named_sizes[ $normalized ] ) ) {
			return $named_sizes[ $normalized ];
		}

		if ( 'smaller' === $normalized ) {
			return ['size' => 0.8, 'unit' => 'em'];
		}
		
		if ( 'larger' === $normalized ) {
			return ['size' => 1.2, 'unit' => 'em'];
		}

		return $this->parse_size_value( $value );
	}
}
