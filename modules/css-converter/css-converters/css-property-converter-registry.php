<?php
namespace Elementor\Modules\CssConverter\CssConverters;

require_once __DIR__ . '/css-property-converter-interface.php';
require_once __DIR__ . '/background-color-converter.php';
require_once __DIR__ . '/color-converter.php';

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


