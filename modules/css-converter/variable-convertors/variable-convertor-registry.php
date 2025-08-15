<?php
namespace Elementor\Modules\CssConverter\VariableConvertors;

class Variable_Convertor_Registry {
	private array $convertors = [];

	public function __construct() {
		$this->auto_register_convertors();
	}

	private function auto_register_convertors() {
		$namespace = __NAMESPACE__ . '\\Convertors\\';
		$dir = __DIR__ . '/convertors/';
		foreach (glob($dir . '*.php') as $file) {
			$class = $namespace . pathinfo($file, PATHINFO_FILENAME);
			if (class_exists($class) && is_subclass_of($class, VariableConvertorInterface::class)) {
				$this->convertors[] = new $class();
			}
		}
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
