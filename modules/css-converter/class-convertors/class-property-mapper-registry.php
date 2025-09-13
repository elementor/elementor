<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Property_Mapper_Registry {
	private $mappers = [];

	public function __construct() {
		// Don't init default mappers here - let the factory handle it
	}

	public function register( Class_Property_Mapper_Interface $mapper ): void {
		$this->mappers[] = $mapper;
	}

	public function resolve( string $property, $value ): ?Class_Property_Mapper_Interface {
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

	private function init_default_mappers(): void {
		$this->register( new Color_Property_Mapper() );
		$this->register( new Font_Size_Property_Mapper() );
	}
}
