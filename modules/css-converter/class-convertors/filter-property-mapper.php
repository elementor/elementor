<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

class Filter_Property_Mapper implements Class_Property_Mapper_Interface {
	const SUPPORTED_PROPERTIES = [ 'filter' ];
	const FILTER_FUNCTIONS = [
		'blur', 'brightness', 'contrast', 'drop-shadow', 'grayscale', 
		'hue-rotate', 'invert', 'opacity', 'saturate', 'sepia'
	];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_filter( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized = $this->normalize_filter_value( $value );
		return [ $property => [ '$$type' => 'string', 'value' => $normalized ] ];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_filter( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}
		
		$value = trim( strtolower( $value ) );
		
		if ( $value === 'none' ) {
			return true;
		}
		
		// Check for valid filter functions
		$pattern = '/(' . implode( '|', self::FILTER_FUNCTIONS ) . ')\s*\([^)]*\)/';
		return 1 === preg_match( $pattern, $value );
	}

	private function normalize_filter_value( string $value ): string {
		$value = trim( $value );
		
		if ( strtolower( $value ) === 'none' ) {
			return 'none';
		}
		
		return $value;
	}
}
