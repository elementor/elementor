<?php
namespace Elementor\Modules\CssConverter\VariableConvertors\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Rgba_Variable_Convertor extends Abstract_Variable_Convertor {
	private const RGBA_PATTERN = '/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/';

	public function supports( string $name, string $value ): bool {
		if ( 1 === preg_match( self::RGBA_PATTERN, $value ) ) {
			return true;
		}
		return false;
	}

	protected function get_type(): string {
		return 'color-rgba';
	}

	protected function normalize_value( string $value ): string {
		return $this->normalize_rgba( $value );
	}

	private function normalize_rgba( string $rgba ): string {
		if ( preg_match( self::RGBA_PATTERN, $rgba, $matches ) ) {
			$red = (int) $matches[1];
			$green = (int) $matches[2];
			$blue = (int) $matches[3];
			$alpha = (float) $matches[4];

			return "rgba({$red}, {$green}, {$blue}, {$alpha})";
		}

		return $rgba;
	}
}
