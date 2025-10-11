<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'color',
		'background-color',
		'border-color',
		'border-top-color',
		'border-right-color',
		'border-bottom-color',
		'border-left-color'
	];

	protected $atomic_prop_type = 'color';

	protected $supported_css_units = [];

	public function map_css_to_atomic( string $css_value ): ?array {
		$normalized_color = $this->normalize_color_value( $css_value );
		if ( null === $normalized_color ) {
			return null;
		}

		return $this->create_atomic_prop( $normalized_color );
	}
}
