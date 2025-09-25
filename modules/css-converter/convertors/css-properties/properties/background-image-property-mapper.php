<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Background_Image_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'background-image' ];
	const URL_PATTERN = '/^url\(\s*["\']?([^"\']+)["\']?\s*\)$/';
	const GRADIENT_PATTERNS = [
		'/^linear-gradient\(/',
		'/^radial-gradient\(/',
		'/^conic-gradient\(/',
		'/^repeating-linear-gradient\(/',
		'/^repeating-radial-gradient\(/',
	];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_background_image( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized = $this->normalize_background_image_value( $value );
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

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		// Basic implementation - convert property name to v4 format
		// Keep original property name with hyphens for consistency
		return $this->create_v4_property( $property, $value );
	}

	private function is_valid_background_image( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );

		if ( 'none' === $value ) {
			return true;
		}

		// Check for URL
		if ( 1 === preg_match( self::URL_PATTERN, $value ) ) {
			return true;
		}

		// Check for gradients
		foreach ( self::GRADIENT_PATTERNS as $pattern ) {
			if ( 1 === preg_match( $pattern, $value ) ) {
				return true;
			}
		}

		return false;
	}

	private function normalize_background_image_value( string $value ): string {
		$value = trim( $value );

		if ( strtolower( $value ) === 'none' ) {
			return 'none';
		}

		// Extract URL from url() function
		if ( 1 === preg_match( self::URL_PATTERN, $value, $matches ) ) {
			$url = trim( $matches[1] );
			return "url('{$url}')";
		}

		// Return gradients as-is (they're complex and should be preserved)
		return $value;
	}
}
