<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

class Padding_Property_Mapper implements Class_Property_Mapper_Interface {
	const SUPPORTED_PROPERTIES = [
		'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'
	];
	const SIZE_PATTERN = '/^(\-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_padding_value( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'padding' ) {
			$parsed = $this->parse_padding_shorthand( $value );
			return [
				'padding' => [
					'$$type' => 'dimensions',
					'value' => [
						'block-start' => [ '$$type' => 'size', 'value' => $parsed['top'] ],
						'inline-end' => [ '$$type' => 'size', 'value' => $parsed['right'] ],
						'block-end' => [ '$$type' => 'size', 'value' => $parsed['bottom'] ],
						'inline-start' => [ '$$type' => 'size', 'value' => $parsed['left'] ],
					],
				],
			];
		}

		$parsed = $this->parse_size_value( $value );
		$dimensions_value = [];
		if ( $property === 'padding-top' ) {
			$dimensions_value['block-start'] = [ '$$type' => 'size', 'value' => $parsed ];
		} elseif ( $property === 'padding-right' ) {
			$dimensions_value['inline-end'] = [ '$$type' => 'size', 'value' => $parsed ];
		} elseif ( $property === 'padding-bottom' ) {
			$dimensions_value['block-end'] = [ '$$type' => 'size', 'value' => $parsed ];
		} elseif ( $property === 'padding-left' ) {
			$dimensions_value['inline-start'] = [ '$$type' => 'size', 'value' => $parsed ];
		}

		return [
			'padding' => [
				'$$type' => 'dimensions',
				'value' => $dimensions_value,
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_padding_value( string $property, $value ): bool {
		if ( $property === 'padding' ) {
			return is_string( $value ) && preg_match( '/^([\-\d\.]+(px|em|rem|%|vh|vw)?\s*){1,4}$/', trim( $value ) );
		}
		return $this->is_valid_size( $value );
	}

	private function is_valid_size( $value ): bool {
		return is_string( $value ) && 1 === preg_match( self::SIZE_PATTERN, trim( $value ) );
	}

	private function parse_padding_shorthand( string $value ): array {
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
			return [ 'size' => $number, 'unit' => $unit ];
		}
		return [ 'size' => 0, 'unit' => 'px' ];
	}
}
