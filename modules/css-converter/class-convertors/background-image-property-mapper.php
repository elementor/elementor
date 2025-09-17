<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Background_Image_Property_Mapper extends Unified_Property_Mapper_Base {
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
