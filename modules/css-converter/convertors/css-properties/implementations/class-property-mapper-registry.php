<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

class Class_Property_Mapper_Registry {
	private $mappers = [];

	public function __construct() {
		// Don't init default mappers here - let the factory handle it
	}

	public function register( Property_Mapper_Interface $mapper ): void {
		$this->mappers[] = $mapper;
	}

	public function resolve( string $property, $value ): ?Property_Mapper_Interface {
		foreach ( $this->mappers as $mapper ) {
			if ( $mapper->supports( $property, $value ) ) {
				return $mapper;
			}
		}

		return null;
	}

	public function get_all_supported_properties(): array {
		$properties = [];

		foreach ( $this->mappers as $mapper ) {
			$properties = array_merge( $properties, $mapper->get_supported_properties() );
		}

		return array_unique( $properties );
	}

}
