<?php
namespace Elementor\Modules\CssConverter\CssConverters;

class Color_Converter implements CssPropertyConverterInterface {
	public function convert( string $value, array $schema ): array {
		if ( ! isset( $schema['color'] ) ) {
			return [];
		}

		return [
			'color' => $value,
		];
	}
}


