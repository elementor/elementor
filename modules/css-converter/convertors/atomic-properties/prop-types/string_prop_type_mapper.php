<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class String_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'display',
		'position',
		'flex-direction',
		'align-items',
		'justify-content',
		'text-align',
		'text-transform',
		'text-decoration',
		'font-weight',
		'font-style',
		'overflow',
		'visibility'
	];

	protected $atomic_prop_type = 'string';

	protected $supported_css_units = [];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( empty( $css_value ) ) {
			return null;
		}

		return $this->create_atomic_prop( $css_value );
	}
}
