<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Radius_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'border-radius',
		'border-top-left-radius',
		'border-top-right-radius',
		'border-bottom-right-radius',
		'border-bottom-left-radius'
	];

	protected $atomic_prop_type = 'border-radius';

	protected $supported_css_units = [
		'px', 'em', 'rem', '%'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		$parsed = $this->parse_border_radius_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		$border_radius_value = [
			'start-start' => $this->create_size_prop( $parsed['top_left'] ),
			'start-end' => $this->create_size_prop( $parsed['top_right'] ),
			'end-end' => $this->create_size_prop( $parsed['bottom_right'] ),
			'end-start' => $this->create_size_prop( $parsed['bottom_left'] ),
		];

		return $this->create_atomic_prop( $border_radius_value );
	}

	private function create_size_prop( array $size_data ): array {
		return [
			'$$type' => 'size',
			'value' => $size_data
		];
	}

	private function parse_border_radius_value( string $css_value ): ?array {
		$values = preg_split( '/\s+/', trim( $css_value ) );
		$count = count( $values );

		if ( 0 === $count || $count > 4 ) {
			return null;
		}

		$parsed_values = [];
		foreach ( $values as $value ) {
			$parsed = $this->parse_size_value( $value );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[] = $parsed;
		}

		switch ( $count ) {
			case 1:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[0],
					'bottom_right' => $parsed_values[0],
					'bottom_left' => $parsed_values[0],
				];
			case 2:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[1],
					'bottom_right' => $parsed_values[0],
					'bottom_left' => $parsed_values[1],
				];
			case 3:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[1],
					'bottom_right' => $parsed_values[2],
					'bottom_left' => $parsed_values[1],
				];
			case 4:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[1],
					'bottom_right' => $parsed_values[2],
					'bottom_left' => $parsed_values[3],
				];
		}

		return null;
	}
}
