<?php
namespace Elementor\Modules\CssConverter\Convertors\Classes;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Transition_Property_Mapper extends Unified_Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay' ];
	const TIME_PATTERN = '/^(\d*\.?\d+)(s|ms)$/';
	const TIMING_FUNCTIONS = [
		'ease',
		'linear',
		'ease-in',
		'ease-out',
		'ease-in-out',
		'step-start',
		'step-end',
	];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_transition_property( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'transition' ) {
			$parsed = $this->parse_transition_shorthand( $value );
			$result = [];

			if ( isset( $parsed['property'] ) ) {
				$result['transition-property'] = [
					'$$type' => 'string',
					'value' => $parsed['property'],
				];
			}
			if ( isset( $parsed['duration'] ) ) {
				$result['transition-duration'] = [
					'$$type' => 'string',
					'value' => $parsed['duration'],
				];
			}
			if ( isset( $parsed['timing-function'] ) ) {
				$result['transition-timing-function'] = [
					'$$type' => 'string',
					'value' => $parsed['timing-function'],
				];
			}
			if ( isset( $parsed['delay'] ) ) {
				$result['transition-delay'] = [
					'$$type' => 'string',
					'value' => $parsed['delay'],
				];
			}

			return $result;
		}

		$normalized = $this->normalize_transition_value( $property, $value );
		return [
			$property => [
				'$$type' => 'string',
				'value' => $normalized,
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_transition_property( string $property, $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );

		if ( $property === 'transition' ) {
			return $value === 'none' || strlen( $value ) > 0;
		}

		if ( $property === 'transition-property' ) {
			return $value === 'none' || $value === 'all' || strlen( $value ) > 0;
		}

		if ( in_array( $property, [ 'transition-duration', 'transition-delay' ], true ) ) {
			return 1 === preg_match( self::TIME_PATTERN, $value );
		}

		if ( $property === 'transition-timing-function' ) {
			return in_array( $value, self::TIMING_FUNCTIONS, true ) ||
					false !== strpos( $value, 'cubic-bezier(' ) ||
					false !== strpos( $value, 'steps(' );
		}

		return false;
	}

	private function parse_transition_shorthand( string $value ): array {
		$value = trim( strtolower( $value ) );

		if ( $value === 'none' ) {
			return [ 'property' => 'none' ];
		}

		$result = [];
		$parts = preg_split( '/\s+/', $value );

		foreach ( $parts as $part ) {
			$part = trim( $part );

			// Check for time values (duration/delay)
			if ( 1 === preg_match( self::TIME_PATTERN, $part ) ) {
				if ( ! isset( $result['duration'] ) ) {
					$result['duration'] = $part;
				} elseif ( ! isset( $result['delay'] ) ) {
					$result['delay'] = $part;
				}
			}
			// Check for timing functions
			elseif ( in_array( $part, self::TIMING_FUNCTIONS, true ) ||
					false !== strpos( $part, 'cubic-bezier(' ) ||
					false !== strpos( $part, 'steps(' ) ) {
				$result['timing-function'] = $part;
			}
			// Everything else is likely a property name
			elseif ( ! isset( $result['property'] ) ) {
					$result['property'] = $part;
			}
		}

		return $result;
	}

	private function normalize_transition_value( string $property, string $value ): string {
		$value = trim( $value );

		if ( $property === 'transition-timing-function' ) {
			$lower = strtolower( $value );
			if ( in_array( $lower, self::TIMING_FUNCTIONS, true ) ) {
				return $lower;
			}
		}

		return $value;
	}
}
