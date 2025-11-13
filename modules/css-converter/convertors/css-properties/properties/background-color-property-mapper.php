<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Color_Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Css_Variable_Aware_Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Background Color Property Mapper
 *
 * 🎯 ATOMIC SOURCE: atomic widgets use Color_Prop_Type for background-color
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 */
class Background_Color_Property_Mapper extends Color_Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'background-color',
	];

	protected function generate_atomic_prop_type( string $property, string $color_value ): ?array {
		$background_data = [
			'color' => $this->create_color_prop_type( $color_value ),
		];

		return Background_Prop_Type::make()->generate( $background_data );
	}

	public function get_target_property_name( string $source_property ): string {
		return 'background';
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}
}
