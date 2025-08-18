<?php
namespace Elementor\Modules\CssConverter\VariableConvertors\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\VariableConvertors\VariableConvertorInterface;

class Color_Rgba_Variable_Convertor implements VariableConvertorInterface {
	private const RGBA_PATTERN = '/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/';

	public function supports( string $name, string $value ): bool {
		return 1 === preg_match( self::RGBA_PATTERN, $value );
	}

	public function convert( string $name, string $value ): array {
		$normalized_rgba = $this->normalize_rgba( $value );
		$variable_id = $this->generate_variable_id( $name );

		return [
			'id' => $variable_id,
			'type' => 'color-rgba',
			'value' => $normalized_rgba,
			'source' => 'css-variable',
			'name' => $name,
		];
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

	private function generate_variable_id( string $name ): string {
		$trimmed = ltrim( $name, '-' );
		$slug = strtolower( $trimmed );
		$slug = preg_replace( '/[^a-z0-9_\-]+/', '-', $slug );
		$slug = trim( $slug, '-' );

		if ( '' === $slug ) {
			$slug = 'color-rgba-variable';
		}

		return $slug;
	}
}
