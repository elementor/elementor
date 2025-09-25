<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Margin_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [
		'margin',
		'margin-top',
		'margin-right',
		'margin-bottom',
		'margin-left',
	];
	const SIZE_PATTERN = '/^(\-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_margin_value( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'margin' ) {
			$parsed = $this->parse_margin_shorthand( $value );
			return [
				'margin' => [
					'$$type' => 'dimensions',
					'value' => [
						'block-start' => [
							'$$type' => 'size',
							'value' => $parsed['top'],
						],
						'inline-end' => [
							'$$type' => 'size',
							'value' => $parsed['right'],
						],
						'block-end' => [
							'$$type' => 'size',
							'value' => $parsed['bottom'],
						],
						'inline-start' => [
							'$$type' => 'size',
							'value' => $parsed['left'],
						],
					],
				],
			];
		}

		$parsed = $this->parse_size_value( $value );
		$dimensions_value = [];
		if ( $property === 'margin-top' ) {
			$dimensions_value['block-start'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		} elseif ( $property === 'margin-right' ) {
			$dimensions_value['inline-end'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		} elseif ( $property === 'margin-bottom' ) {
			$dimensions_value['block-end'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		} elseif ( $property === 'margin-left' ) {
			$dimensions_value['inline-start'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		}

		return [
			'margin' => [
				'$$type' => 'dimensions',
				'value' => $dimensions_value,
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

		if ( $property === 'margin' ) {
			// Handle margin shorthand
			$parsed = $this->parse_margin_shorthand( $value );
			if ( ! $parsed ) {
				return null;
			}

			$dimensions_value = [
				'block-start' => [
					'$$type' => 'size',
					'value' => $parsed['top'],
				],
				'inline-end' => [
					'$$type' => 'size',
					'value' => $parsed['right'],
				],
				'block-end' => [
					'$$type' => 'size',
					'value' => $parsed['bottom'],
				],
				'inline-start' => [
					'$$type' => 'size',
					'value' => $parsed['left'],
				],
			];

			return $this->create_v4_property_with_type( 'margin', 'dimensions', $dimensions_value );
		}

		// Handle individual margin properties (margin-top, margin-bottom, etc.)
		$parsed = $this->parse_size_value( $value );
		$dimensions_value = [];

		if ( $property === 'margin-top' ) {
			$dimensions_value['block-start'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		} elseif ( $property === 'margin-right' ) {
			$dimensions_value['inline-end'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		} elseif ( $property === 'margin-bottom' ) {
			$dimensions_value['block-end'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		} elseif ( $property === 'margin-left' ) {
			$dimensions_value['inline-start'] = [
				'$$type' => 'size',
				'value' => $parsed,
			];
		}

		return $this->create_v4_property_with_type( 'margin', 'dimensions', $dimensions_value );
	}

	private function is_valid_margin_value( string $property, $value ): bool {
		if ( $property === 'margin' ) {
			return is_string( $value ) && preg_match( '/^([\-\d\.]+(px|em|rem|%|vh|vw)?\s*){1,4}$/', trim( $value ) );
		}
		return $this->is_valid_size( $value );
	}

	private function is_valid_size( $value ): bool {
		return is_string( $value ) && 1 === preg_match( self::SIZE_PATTERN, trim( $value ) );
	}

	private function parse_margin_shorthand( string $value ): array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$count = count( $parts );
		$top = $right = $bottom = $left = '0px';
		if ( $count === 1 ) {
			$top = $right = $bottom = $left = $parts[0];
		} elseif ( $count === 2 ) {
			$top = $bottom = $parts[0];
			$right = $left = $parts[1];
		} elseif ( $count === 3 ) {
			$top = $parts[0];
			$right = $left = $parts[1];
			$bottom = $parts[2];
		} elseif ( $count === 4 ) {
			$top = $parts[0];
			$right = $parts[1];
			$bottom = $parts[2];
			$left = $parts[3];
		}
		return [
			'top' => $this->parse_size_value( $top ),
			'right' => $this->parse_size_value( $right ),
			'bottom' => $this->parse_size_value( $bottom ),
			'left' => $this->parse_size_value( $left ),
		];
	}

	private function parse_size_value( string $value ): array {
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
}
