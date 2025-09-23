<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Border_Radius_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [
		'border-radius',
		'border-top-left-radius',
		'border-top-right-radius',
		'border-bottom-right-radius',
		'border-bottom-left-radius',
	];
	const SIZE_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_border_radius( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'border-radius' ) {
			$parsed = $this->parse_border_radius_shorthand( $value );
			return [
				'border-top-left-radius' => [
					'$$type' => 'size',
					'value' => $parsed['top-left'],
				],
				'border-top-right-radius' => [
					'$$type' => 'size',
					'value' => $parsed['top-right'],
				],
				'border-bottom-right-radius' => [
					'$$type' => 'size',
					'value' => $parsed['bottom-right'],
				],
				'border-bottom-left-radius' => [
					'$$type' => 'size',
					'value' => $parsed['bottom-left'],
				],
			];
		}
		if ( in_array($property, [
			'border-top-left-radius',
			'border-top-right-radius',
			'border-bottom-right-radius',
			'border-bottom-left-radius',
		], true) ) {
			$parsed = $this->parse_radius_value( $value );
			return [
				$property => [
					'$$type' => 'size',
					'value' => $parsed,
				],
			];
		}
		$parsed = $this->parse_radius_value( $value );
		return [
			$property => [
				'$$type' => 'size',
				'value' => $parsed,
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		if ( $property === 'border-radius' ) {
			$parsed = $this->parse_border_radius_shorthand( $value );
			
			// Check if all corners have the same value (uniform radius)
			if ( $this->is_uniform_radius( $parsed ) ) {
				// Use simple size type for uniform radius
				return $this->create_v4_property_with_type( 'border-radius', 'size', $parsed['top-left'] );
			} else {
				// Use border-radius type with logical properties for individual corners
				$border_radius_value = [
					'start-start' => [
						'$$type' => 'size',
						'value' => $parsed['top-left'],
					],
					'start-end' => [
						'$$type' => 'size',
						'value' => $parsed['top-right'],
					],
					'end-start' => [
						'$$type' => 'size',
						'value' => $parsed['bottom-left'],
					],
					'end-end' => [
						'$$type' => 'size',
						'value' => $parsed['bottom-right'],
					],
				];
				
				return $this->create_v4_property_with_type( 'border-radius', 'border-radius', $border_radius_value );
			}
		}

		// For individual corner properties, use size type
		$parsed = $this->parse_radius_value( $value );
		return $this->create_v4_property_with_type( $property, 'size', $parsed );
	}

	private function is_valid_border_radius( string $property, $value ): bool {
		if ( $property === 'border-radius' ) {
			return is_string( $value ) && preg_match( '/^([\d\.]+(px|em|rem|%|vh|vw)?\s*){1,4}$/', trim( $value ) );
		}
		return $this->is_valid_radius_value( $value );
	}

	private function is_valid_radius_value( $value ): bool {
		return is_string( $value ) && 1 === preg_match( self::SIZE_PATTERN, trim( $value ) );
	}

	private function parse_border_radius_shorthand( string $value ): array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$count = count( $parts );
		$top_left = $top_right = $bottom_right = $bottom_left = '0px';

		if ( $count === 1 ) {
			$top_left = $top_right = $bottom_right = $bottom_left = $parts[0];
		} elseif ( $count === 2 ) {
			$top_left = $bottom_right = $parts[0];
			$top_right = $bottom_left = $parts[1];
		} elseif ( $count === 3 ) {
			$top_left = $parts[0];
			$top_right = $bottom_left = $parts[1];
			$bottom_right = $parts[2];
		} elseif ( $count === 4 ) {
			$top_left = $parts[0];
			$top_right = $parts[1];
			$bottom_right = $parts[2];
			$bottom_left = $parts[3];
		}

		return [
			'top-left' => $this->parse_radius_value( $top_left ),
			'top-right' => $this->parse_radius_value( $top_right ),
			'bottom-right' => $this->parse_radius_value( $bottom_right ),
			'bottom-left' => $this->parse_radius_value( $bottom_left ),
		];
	}

	private function parse_radius_value( string $value ): array {
		if ( 1 === preg_match( self::SIZE_PATTERN, $value, $matches ) ) {
			$number = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			if ( 0 === $number % 1 ) {
				$number = (int) $number;
			}
			return [
				'size' => $number,
				'unit' => $unit,
			];
		}

		return [
			'size' => 0,
			'unit' => 'px',
		];
	}

	private function is_uniform_radius( array $parsed ): bool {
		// Check if all corners have the same size and unit
		$reference = $parsed['top-left'];
		
		return $parsed['top-right']['size'] === $reference['size'] &&
			   $parsed['top-right']['unit'] === $reference['unit'] &&
			   $parsed['bottom-right']['size'] === $reference['size'] &&
			   $parsed['bottom-right']['unit'] === $reference['unit'] &&
			   $parsed['bottom-left']['size'] === $reference['size'] &&
			   $parsed['bottom-left']['unit'] === $reference['unit'];
	}
}
