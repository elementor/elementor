<?php
namespace Elementor\Modules\CssConverter\CssConverters;

class Background_Color_Converter implements CssPropertyConverterInterface {
	public function convert( string $value, array $schema ): array {
		if ( ! isset( $schema['background'] ) ) {
			return [];
		}

		return [
			'background' => [
				'color' => $value,
			],
		];
	}
}


