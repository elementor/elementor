<?php
namespace Elementor\Modules\CssConverter\VariableConvertors\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Rgb_Variable_Convertor extends Abstract_Variable_Convertor {
	private const RGB_PATTERN = '/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/';

	public function supports( string $name, string $value ): bool {
		if ( 1 === preg_match( self::RGB_PATTERN, $value ) ) {
			return true;
		}
		return false;
	}

	protected function get_type(): string {
		return 'color-rgb';
	}

	protected function normalize_value( string $value ): string {
		return $this->normalize_rgb( $value );
	}

	private function normalize_rgb( string $rgb ): string {
		if ( preg_match( self::RGB_PATTERN, $rgb, $matches ) ) {
			$red = (int) $matches[1];
			$green = (int) $matches[2];
			$blue = (int) $matches[3];

			return "rgb({$red}, {$green}, {$blue})";
		}

		return $rgb;
	}
}
