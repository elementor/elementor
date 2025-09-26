<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Atomic_Prop_Mapper_Interface {
	public function get_supported_properties(): array;
	public function supports_property( string $property ): bool;
	public function map_css_to_atomic( string $css_value ): ?array;
	public function get_atomic_prop_type(): string;
	public function validate_atomic_output( array $output ): bool;
	public function get_supported_css_units(): array;
}
