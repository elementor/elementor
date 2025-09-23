<?php
namespace Elementor\Modules\CssConverter\Convertors\Variables;

use Elementor\Modules\CssConverter\Convertors\Variables\Convertors\Color_Hex_Variable_Convertor;
use Elementor\Modules\CssConverter\Convertors\Variables\Convertors\Color_Rgb_Variable_Convertor;
use Elementor\Modules\CssConverter\Convertors\Variables\Convertors\Color_Rgba_Variable_Convertor;
use Elementor\Modules\CssConverter\Convertors\Variables\Convertors\Length_Size_Viewport_Variable_Convertor;
use Elementor\Modules\CssConverter\Convertors\Variables\Convertors\Percentage_Variable_Convertor;

class Variable_Convertor_Registry {
	private array $convertors = [];

	public function __construct() {
		$this->convertors = [
			new Color_Hex_Variable_Convertor(),
			new Color_Rgb_Variable_Convertor(),
			new Color_Rgba_Variable_Convertor(),
			new Length_Size_Viewport_Variable_Convertor(),
			new Percentage_Variable_Convertor(),
		];
	}

	public function register( VariableConvertorInterface $convertor ): void {
		$this->convertors[] = $convertor;
	}

	public function resolve( string $name, string $value ): ?VariableConvertorInterface {
		foreach ( $this->convertors as $convertor ) {
			if ( $convertor->supports( $name, $value ) ) {
				return $convertor;
			}
		}
		return null;
	}
}
