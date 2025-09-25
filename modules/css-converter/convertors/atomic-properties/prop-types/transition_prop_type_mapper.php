<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Transition_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'transition',
		'transition-property',
		'transition-duration',
		'transition-timing-function',
		'transition-delay'
	];

	protected $atomic_prop_type = 'transition';

	protected $supported_css_units = [
		's', 'ms'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( empty( $css_value ) || 'none' === $css_value ) {
			return null;
		}

		if ( 'transition' === $this->get_current_property() ) {
			return $this->parse_transition_shorthand( $css_value );
		}

		return $this->parse_individual_transition_property( $css_value );
	}

	private function parse_transition_shorthand( string $css_value ): ?array {
		$transitions = $this->split_transition_values( $css_value );
		$transition_array = [];

		foreach ( $transitions as $transition_string ) {
			$transition = $this->parse_single_transition( trim( $transition_string ) );
			if ( null !== $transition ) {
				$transition_array[] = $transition;
			}
		}

		return empty( $transition_array ) ? null : $this->create_atomic_prop( $transition_array );
	}

	private function split_transition_values( string $css_value ): array {
		$transitions = [];
		$current_transition = '';
		$paren_depth = 0;
		$length = strlen( $css_value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $css_value[ $i ];

			if ( '(' === $char ) {
				$paren_depth++;
			} elseif ( ')' === $char ) {
				$paren_depth--;
			} elseif ( ',' === $char && 0 === $paren_depth ) {
				$transitions[] = $current_transition;
				$current_transition = '';
				continue;
			}

			$current_transition .= $char;
		}

		if ( ! empty( $current_transition ) ) {
			$transitions[] = $current_transition;
		}

		return $transitions;
	}

	private function parse_single_transition( string $transition_string ): ?array {
		$parts = preg_split( '/\s+/', $transition_string );
		$property = 'all';
		$duration = [ 'value' => 0.0, 'unit' => 's' ];
		$timing_function = 'ease';
		$delay = [ 'value' => 0.0, 'unit' => 's' ];

		foreach ( $parts as $part ) {
			if ( $this->is_time_value( $part ) ) {
				$parsed_time = $this->parse_time_value( $part );
				if ( 0.0 === $duration['value'] ) {
					$duration = $parsed_time;
				} else {
					$delay = $parsed_time;
				}
			} elseif ( $this->is_timing_function( $part ) ) {
				$timing_function = $part;
			} elseif ( $this->is_css_property( $part ) ) {
				$property = $part;
			}
		}

		return [
			'property' => [ '$$type' => 'string', 'value' => $property ],
			'duration' => [ '$$type' => 'time', 'value' => $duration ],
			'timing-function' => [ '$$type' => 'string', 'value' => $timing_function ],
			'delay' => [ '$$type' => 'time', 'value' => $delay ],
		];
	}

	private function parse_individual_transition_property( string $css_value ): ?array {
		$current_property = $this->get_current_property();

		switch ( $current_property ) {
			case 'transition-property':
				return $this->create_atomic_prop( [
					'property' => [ '$$type' => 'string', 'value' => $css_value ]
				] );
			case 'transition-duration':
				$duration = $this->parse_time_value( $css_value );
				return $this->create_atomic_prop( [
					'duration' => [ '$$type' => 'time', 'value' => $duration ]
				] );
			case 'transition-timing-function':
				return $this->create_atomic_prop( [
					'timing-function' => [ '$$type' => 'string', 'value' => $css_value ]
				] );
			case 'transition-delay':
				$delay = $this->parse_time_value( $css_value );
				return $this->create_atomic_prop( [
					'delay' => [ '$$type' => 'time', 'value' => $delay ]
				] );
		}

		return null;
	}

	private function is_time_value( string $value ): bool {
		return (bool) preg_match( '/^\d*\.?\d+(s|ms)$/i', $value );
	}

	private function parse_time_value( string $time_string ): array {
		if ( preg_match( '/^(\d*\.?\d+)(s|ms)$/i', $time_string, $matches ) ) {
			$value = (float) $matches[1];
			$unit = strtolower( $matches[2] );

			if ( 'ms' === $unit ) {
				$value = $value / 1000;
				$unit = 's';
			}

			return [ 'value' => $value, 'unit' => $unit ];
		}

		return [ 'value' => 0.0, 'unit' => 's' ];
	}

	private function is_timing_function( string $value ): bool {
		$timing_functions = [
			'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear',
			'step-start', 'step-end'
		];

		return in_array( $value, $timing_functions, true ) || 
			   false !== strpos( $value, 'cubic-bezier(' ) ||
			   false !== strpos( $value, 'steps(' );
	}

	private function is_css_property( string $value ): bool {
		$common_properties = [
			'all', 'opacity', 'transform', 'color', 'background-color',
			'width', 'height', 'margin', 'padding', 'border', 'font-size'
		];

		return in_array( $value, $common_properties, true ) || 
			   ! $this->is_time_value( $value ) && 
			   ! $this->is_timing_function( $value );
	}

	private function get_current_property(): string {
		return 'transition';
	}
}
