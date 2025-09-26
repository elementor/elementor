<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Shadow_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'text-shadow'
	];

	protected $atomic_prop_type = 'shadow';

	protected $supported_css_units = [
		'px', 'em', 'rem', '%', 'vh', 'vw'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( 'none' === $css_value ) {
			return null;
		}

		$parsed = $this->parse_text_shadow_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		$shadow_value = [
			'hOffset' => [
				'$$type' => 'size',
				'value' => $parsed['h_offset']
			],
			'vOffset' => [
				'$$type' => 'size',
				'value' => $parsed['v_offset']
			],
			'blur' => [
				'$$type' => 'size',
				'value' => $parsed['blur']
			],
			'color' => [
				'$$type' => 'color',
				'value' => $parsed['color']
			],
		];

		return $this->create_atomic_prop( $shadow_value );
	}

	private function parse_text_shadow_value( string $css_value ): ?array {
		$pattern = '/^(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*)?(.*)$/';
		
		if ( ! preg_match( $pattern, $css_value, $matches ) ) {
			return null;
		}

		$h_offset = $this->parse_size_value( $matches[1] );
		$v_offset = $this->parse_size_value( $matches[2] );
		$blur = ! empty( $matches[3] ) ? $this->parse_size_value( $matches[3] ) : [ 'size' => 0.0, 'unit' => 'px' ];
		$color_string = ! empty( $matches[4] ) ? trim( $matches[4] ) : '#000000';

		if ( null === $h_offset || null === $v_offset ) {
			return null;
		}

		$color = $this->normalize_color_value( $color_string );
		if ( null === $color ) {
			$color = '#000000';
		}

		return [
			'h_offset' => $h_offset,
			'v_offset' => $v_offset,
			'blur' => $blur,
			'color' => $color
		];
	}
}
