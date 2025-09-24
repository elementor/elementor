<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'font-size',
		'width',
		'height',
		'max-width',
		'min-width',
		'max-height',
		'min-height',
		'top',
		'right',
		'bottom',
		'left'
	];

	protected $atomic_prop_type = 'size';

	protected $supported_css_units = [
		'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex', 'auto'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		$parsed = $this->parse_size_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		return $this->create_atomic_prop( $parsed );
	}
}
