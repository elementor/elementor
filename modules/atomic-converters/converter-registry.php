<?php

namespace Elementor\Modules\AtomicConverters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Converter_Registry {
	private array $converters = [];

	public function register( Property_Converter_Interface $converter ): void {
		foreach ( $converter->get_supported_properties() as $property ) {
			$this->converters[ $property ] = $converter;
		}
	}

	public function resolve( string $property ): ?Property_Converter_Interface {
		return $this->converters[ $property ] ?? null;
	}
}

