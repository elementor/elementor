<?php
namespace Elementor\Modules\CssConverter\VariableConvertors\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\VariableConvertors\VariableConvertorInterface;

class Color_Rgb_Variable_Convertor implements VariableConvertorInterface {
	private const RGB_PATTERN = '/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/';

	public function supports( string $name, string $value ): bool {
		return 1 === preg_match( self::RGB_PATTERN, $value );
	}

	public function convert( string $name, string $value ): array {
		$normalized_rgb = $this->normalize_rgb( $value );
		$variable_id = $this->generate_variable_id( $name );

		return [
			'id' => $variable_id,
			'type' => 'color-rgb',
			'value' => $normalized_rgb,
			'source' => 'css-variable',
			'name' => $name,
		];
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

	private function generate_variable_id( string $name ): string {
		$trimmed = ltrim( $name, '-' );
		$slug = strtolower( $trimmed );
		$slug = preg_replace( '/[^a-z0-9_\-]+/', '-', $slug );
		$slug = trim( $slug, '-' );

		if ( '' === $slug ) {
			$slug = 'color-rgb-variable';
		}

		return $slug;
	}
}
