<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Margin_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['margin'];

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_dimensions_shorthand( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		return $this->create_v4_property_with_type( 
			$property, 
			'dimensions', 
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

		$parsed_value = $this->parse_dimensions_shorthand( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		return [
			$property => [
				'$$type' => 'dimensions',
				'value' => $parsed_value
			]
		];
	}

	protected function parse_dimensions_shorthand( string $value ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		if ( 0 === $count || $count > 4 ) {
			return null;
		}

		$parsed_values = [];
		foreach ( $values as $val ) {
			$parsed = $this->parse_size_value( $val );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[] = $parsed;
		}

		switch ( $count ) {
			case 1:
				return [
					'margin-top' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'margin-right' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'margin-bottom' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'margin-left' => ['$$type' => 'size', 'value' => $parsed_values[0]],
				];
			case 2:
				return [
					'margin-top' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'margin-right' => ['$$type' => 'size', 'value' => $parsed_values[1]],
					'margin-bottom' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'margin-left' => ['$$type' => 'size', 'value' => $parsed_values[1]],
				];
			case 3:
				return [
					'margin-top' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'margin-right' => ['$$type' => 'size', 'value' => $parsed_values[1]],
					'margin-bottom' => ['$$type' => 'size', 'value' => $parsed_values[2]],
					'margin-left' => ['$$type' => 'size', 'value' => $parsed_values[1]],
				];
			case 4:
				return [
					'margin-top' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'margin-right' => ['$$type' => 'size', 'value' => $parsed_values[1]],
					'margin-bottom' => ['$$type' => 'size', 'value' => $parsed_values[2]],
					'margin-left' => ['$$type' => 'size', 'value' => $parsed_values[3]],
				];
		}

		return null;
	}
}
