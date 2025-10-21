<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Color_Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Css_Variable_Aware_Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Color_Property_Mapper extends Color_Atomic_Property_Mapper_Base {

	public function get_supported_properties(): array {
		return [
			'border-color',
			'border-top-color',
			'border-right-color',
			'border-bottom-color',
			'border-left-color',
		];
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	protected function should_process_property( string $property ): bool {
		$individual_properties = [ 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color' ];
		return ! in_array( $property, $individual_properties, true );
	}

	protected function generate_atomic_prop_type( string $property, string $color_value ): ?array {
		return $this->create_color_prop_type( $color_value );
	}


	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}
}
