<?php

namespace Elementor\Modules\AtomicConverters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Property_Converter_Interface {
	public function supports( string $property, $value = null ): bool;

	public function convert( string $property, $value ): ?array;

	public function get_supported_properties(): array;
}
