<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

class Border_Style_Property_Mapper implements Class_Property_Mapper_Interface {
	const SUPPORTED_PROPERTIES = [
		'border-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'
	];
	const VALID_STYLES = [
		'none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'
	];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_border_style( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'border-style' ) {
			$parsed = $this->parse_border_style_shorthand( $value );
			return [
				'border-top-style' => [ '$$type' => 'string', 'value' => $parsed['top'] ],
				'border-right-style' => [ '$$type' => 'string', 'value' => $parsed['right'] ],
				'border-bottom-style' => [ '$$type' => 'string', 'value' => $parsed['bottom'] ],
				'border-left-style' => [ '$$type' => 'string', 'value' => $parsed['left'] ],
			];
		}
		$normalized = $this->normalize_border_style( $value );
		return [ $property => [ '$$type' => 'string', 'value' => $normalized ] ];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_border_style( string $property, $value ): bool {
		if ( $property === 'border-style' ) {
			$parts = preg_split( '/\s+/', trim( $value ) );
			if ( count( $parts ) > 4 ) {
				return false;
			}
			foreach ( $parts as $part ) {
				if ( ! $this->is_valid_style_value( $part ) ) {
					return false;
				}
			}
			return true;
		}
		return $this->is_valid_style_value( $value );
	}

	private function is_valid_style_value( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}
		$value = trim( strtolower( $value ) );
		return in_array( $value, self::VALID_STYLES, true );
	}

	private function parse_border_style_shorthand( string $value ): array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$count = count( $parts );
		$top = $right = $bottom = $left = 'none';
		
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
			'top' => $this->normalize_border_style( $top ),
			'right' => $this->normalize_border_style( $right ),
			'bottom' => $this->normalize_border_style( $bottom ),
			'left' => $this->normalize_border_style( $left ),
		];
	}

	private function normalize_border_style( string $value ): string {
		$value = trim( strtolower( $value ) );
		return in_array( $value, self::VALID_STYLES, true ) ? $value : 'none';
	}
}
