<?php
namespace Elementor\Modules\CssConverter\CssConverters;

class CssPropertyConverterRegistry {
	private array $converters = [];

	public function __construct() {
		$this->converters = [
			'background-color' => new Background_Color_Converter(),
			'color' => new Color_Converter(),
		];
	}

	public function getConverter( string $property ): ?CssPropertyConverterInterface {
		return $this->converters[ $property ] ?? null;
	}
}