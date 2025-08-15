<?php
namespace Elementor\Modules\CssConverter\VariableConvertors\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\VariableConvertors\VariableConvertorInterface;

class Color_Hex_Variable_Convertor implements VariableConvertorInterface {
	private const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	private const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';

	public function supports( string $name, string $value ): bool {
		return 1 === preg_match( self::HEX3_PATTERN, $value ) || 1 === preg_match( self::HEX6_PATTERN, $value );
	}

	public function convert( string $name, string $value ): array {
		$normalized_hex = $this->normalize_hex( $value );
		$variable_id = $this->generate_variable_id( $name );

		return [
			'id' => $variable_id,
			'type' => 'color-hex',
			'value' => $normalized_hex,
			'source' => 'css-variable',
			'name' => $name,
		];
	}

	private function normalize_hex( string $hex ): string {
		$lower = strtolower( $hex );

		if ( 1 === preg_match( self::HEX6_PATTERN, $lower ) ) {
			return $lower;
		}

		$digits = substr( $lower, 1 );
		return '#' . $digits[0] . $digits[0] . $digits[1] . $digits[1] . $digits[2] . $digits[2];
	}

	private function generate_variable_id( string $name ): string {
		$trimmed = ltrim( $name, '-' );
		$slug = strtolower( $trimmed );
		$slug = preg_replace( '/[^a-z0-9_\-]+/', '-', $slug );
		$slug = trim( $slug, '-' );

		if ( '' === $slug ) {
			$slug = 'color-variable';
		}

		return $slug;
	}
}
