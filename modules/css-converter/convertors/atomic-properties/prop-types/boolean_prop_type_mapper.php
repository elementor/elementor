<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Boolean_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'visibility',
		'overflow-hidden'
	];

	protected $atomic_prop_type = 'boolean';

	protected $supported_css_units = [];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( strtolower( $css_value ) );
		
		$boolean_value = $this->convert_to_boolean( $css_value );
		if ( null === $boolean_value ) {
			return null;
		}

		return $this->create_atomic_prop( $boolean_value );
	}

	private function convert_to_boolean( string $css_value ): ?bool {
		$true_values = [ 'true', '1', 'yes', 'on', 'visible', 'block', 'inline', 'flex' ];
		$false_values = [ 'false', '0', 'no', 'off', 'hidden', 'none' ];

		if ( in_array( $css_value, $true_values, true ) ) {
			return true;
		}

		if ( in_array( $css_value, $false_values, true ) ) {
			return false;
		}

		return null;
	}
}
