<?php
namespace Elementor\Modules\CssConverter\VariableConvertors;

interface VariableConvertorInterface {
	public function supports( string $name, string $value ): bool;
	public function convert( string $name, string $value ): array;
}
