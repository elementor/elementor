<?php
namespace Elementor\Modules\CssConverter\Convertors\Variables;

interface VariableConvertorInterface {
	public function supports( string $name, string $value ): bool;
	public function convert( string $name, string $value ): array;
}
