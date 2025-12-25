<?php

namespace Elementor\Modules\AtomicConverters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Property_Converter_Base implements Property_Converter_Interface {
	abstract protected function get_supported_properties_list(): array;

	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	public function get_supported_properties(): array {
		return $this->get_supported_properties_list();
	}

	abstract public function convert( string $property, $value ): ?array;
}

