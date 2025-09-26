<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Box_Shadow_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'box-shadow'
	];

	protected $atomic_prop_type = 'box-shadow';

	protected $supported_css_units = [
		'px', 'em', 'rem', '%', 'vh', 'vw'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( 'none' === $css_value ) {
			return $this->create_atomic_prop( [] );
		}

		$shadows = $this->parse_box_shadow_value( $css_value );
		if ( null === $shadows ) {
			return null;
		}

		$shadow_array = [];
		foreach ( $shadows as $shadow ) {
			$shadow_array[] = $this->create_shadow_prop( $shadow );
		}

		return $this->create_atomic_prop( $shadow_array );
	}

	private function create_shadow_prop( array $shadow_data ): array {
		return [
			'$$type' => 'shadow',
			'value' => [
				'hOffset' => [
					'$$type' => 'size',
					'value' => $shadow_data['h_offset']
				],
				'vOffset' => [
					'$$type' => 'size',
					'value' => $shadow_data['v_offset']
				],
				'blur' => [
					'$$type' => 'size',
					'value' => $shadow_data['blur']
				],
				'spread' => [
					'$$type' => 'size',
					'value' => $shadow_data['spread']
				],
				'color' => [
					'$$type' => 'color',
					'value' => $shadow_data['color']
				],
				'position' => $shadow_data['inset'] ? 'inset' : null
			]
		];
	}

	private function parse_box_shadow_value( string $css_value ): ?array {
		$shadows = [];
		$shadow_strings = $this->split_shadow_values( $css_value );

		foreach ( $shadow_strings as $shadow_string ) {
			$shadow = $this->parse_single_shadow( trim( $shadow_string ) );
			if ( null === $shadow ) {
				return null;
			}
			$shadows[] = $shadow;
		}

		return empty( $shadows ) ? null : $shadows;
	}

	private function split_shadow_values( string $css_value ): array {
		$shadows = [];
		$current_shadow = '';
		$paren_depth = 0;
		$length = strlen( $css_value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $css_value[ $i ];

			if ( '(' === $char ) {
				$paren_depth++;
			} elseif ( ')' === $char ) {
				$paren_depth--;
			} elseif ( ',' === $char && 0 === $paren_depth ) {
				$shadows[] = $current_shadow;
				$current_shadow = '';
				continue;
			}

			$current_shadow .= $char;
		}

		if ( ! empty( $current_shadow ) ) {
			$shadows[] = $current_shadow;
		}

		return $shadows;
	}

	private function parse_single_shadow( string $shadow_string ): ?array {
		$inset = false;
		if ( 0 === strpos( $shadow_string, 'inset' ) ) {
			$inset = true;
			$shadow_string = trim( substr( $shadow_string, 5 ) );
		}

		$pattern = '/^(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*)?(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*)?(.*)$/';

		if ( ! preg_match( $pattern, $shadow_string, $matches ) ) {
			return null;
		}

		$h_offset = $this->parse_size_value( $matches[1] );
		$v_offset = $this->parse_size_value( $matches[2] );
		$blur = ! empty( $matches[3] ) ? $this->parse_size_value( $matches[3] ) : [ 'size' => 0.0, 'unit' => 'px' ];
		$spread = ! empty( $matches[4] ) ? $this->parse_size_value( $matches[4] ) : [ 'size' => 0.0, 'unit' => 'px' ];
		$color_string = ! empty( $matches[5] ) ? trim( $matches[5] ) : '#000000';

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
			'spread' => $spread,
			'color' => $color,
			'inset' => $inset
		];
	}
}
