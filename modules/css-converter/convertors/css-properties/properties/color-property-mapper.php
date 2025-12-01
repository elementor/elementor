<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Color_Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Css_Variable_Aware_Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Color Property Mapper
 *
 * 🎯 ATOMIC SOURCE: atomic-heading.php uses Color_Prop_Type for color
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 */
class Color_Property_Mapper extends Color_Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'color',
	];

	protected function generate_atomic_prop_type( string $property, string $color_value ): ?array {
		return $this->create_color_prop_type( $color_value );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}
}
