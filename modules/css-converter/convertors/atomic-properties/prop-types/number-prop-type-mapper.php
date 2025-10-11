<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Number_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'opacity',
		'z-index',
		'order',
		'flex-grow',
		'flex-shrink',
		'line-height'
	];

	protected $atomic_prop_type = 'number';

	protected $supported_css_units = [];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( ! is_numeric( $css_value ) ) {
			return null;
		}

		$numeric_value = (float) $css_value;
		
		return $this->create_atomic_prop( $numeric_value );
	}
}
