<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Width_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'border-width',
		'border-top-width',
		'border-right-width',
		'border-bottom-width',
		'border-left-width'
	];

	protected $atomic_prop_type = 'border-width';

	protected $supported_css_units = [
		'px', 'em', 'rem', '%'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		if ( 'border-width' === $this->get_current_property() ) {
			return $this->parse_border_width_shorthand( $css_value );
		}

		$parsed = $this->parse_size_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		return $this->create_atomic_prop( $parsed );
	}

	private function parse_border_width_shorthand( string $css_value ): ?array {
		$parsed = $this->parse_dimensions_shorthand( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		$border_width_value = [
			'block-start' => $this->create_size_prop( $parsed['top'] ),
			'inline-end' => $this->create_size_prop( $parsed['right'] ),
			'block-end' => $this->create_size_prop( $parsed['bottom'] ),
			'inline-start' => $this->create_size_prop( $parsed['left'] ),
		];

		return $this->create_atomic_prop( $border_width_value );
	}

	private function create_size_prop( array $size_data ): array {
		return [
			'$$type' => 'size',
			'value' => $size_data
		];
	}

	private function get_current_property(): string {
		return 'border-width';
	}
}
