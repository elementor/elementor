<?php
namespace Elementor\Modules\CssConverter\Convertors\Variables\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Hex_Variable_Convertor extends Abstract_Variable_Convertor {
	private const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	private const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	private const HEXA_PATTERN = '/^#([A-Fa-f0-9]{8})$/';

	public function supports( string $name, string $value ): bool {
		return 1 === preg_match( self::HEX3_PATTERN, $value )
			|| 1 === preg_match( self::HEX6_PATTERN, $value )
			|| 1 === preg_match( self::HEXA_PATTERN, $value );
	}

	protected function get_type(): string {
		return 'color-hex';
	}

	protected function normalize_value( string $value ): string {
		return $this->normalize_hex( $value );
	}

	private function normalize_hex( string $hex ): string {
		$lower = strtolower( $hex );

		if ( 1 === preg_match( self::HEXA_PATTERN, $lower ) ) {
			return $lower;
		}

		if ( 1 === preg_match( self::HEX6_PATTERN, $lower ) ) {
			return $lower;
		}

		$digits = substr( $lower, 1 );
		return '#' . $digits[0] . $digits[0] . $digits[1] . $digits[1] . $digits[2] . $digits[2];
	}
}
