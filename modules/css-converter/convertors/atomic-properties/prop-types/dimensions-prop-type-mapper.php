<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dimensions_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'margin',
		'padding'
	];

	protected $atomic_prop_type = 'dimensions';

	protected $supported_css_units = [
		'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex', 'auto'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		$parsed = $this->parse_dimensions_shorthand( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		$dimensions_value = [
			'block-start' => $this->create_size_prop( $parsed['top'] ),
			'inline-end' => $this->create_size_prop( $parsed['right'] ),
			'block-end' => $this->create_size_prop( $parsed['bottom'] ),
			'inline-start' => $this->create_size_prop( $parsed['left'] ),
		];

		return $this->create_atomic_prop( $dimensions_value );
	}

	private function create_size_prop( array $size_data ): array {
		return [
			'$$type' => 'size',
			'value' => $size_data
		];
	}
}
