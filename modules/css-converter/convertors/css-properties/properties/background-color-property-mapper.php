<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Background_Color_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['background-color'];

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$normalized_color = $this->parse_color_value( $value );
		if ( null === $normalized_color ) {
			return null;
		}

		return $this->create_v4_property_with_type( 
			'background', 
			'background', 
			[
				'color' => $normalized_color
			]
		);
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function supports_v4_conversion( string $property, $value ): bool {
		return $this->supports_property( $property ) && $this->is_valid_css_value( $value );
	}

	public function get_v4_property_name( string $property ): string {
		return 'background';
	}

	// TODO: Replace with atomic widgets approach
	public function map_to_schema( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$normalized_color = $this->parse_color_value( $value );
		if ( null === $normalized_color ) {
			return null;
		}

		return [
			'background-color' => [
				'$$type' => 'color',
				'value' => $normalized_color
			]
		];
	}
}
