<?php
namespace Elementor\Modules\CssConverter\VariableConvertors;

use Elementor\Modules\CssConverter\VariableConvertors\Convertors\Color_Hex_Variable_Convertor;

class Variable_Convertor_Registry {
	private array $convertors = [];

	public function __construct() {
		$this->convertors = [
			new Color_Hex_Variable_Convertor(),
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
