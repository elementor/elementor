<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Atomic_Property_Mapper_Interface {

	public function supports_property( string $property ): bool;

	public function map_to_v4_atomic( string $property, $value ): ?array;

	public function map_to_schema( string $property, $value ): ?array;

	public function validate_atomic_output( array $output ): bool;

	public function get_supported_atomic_widgets(): array;

	public function get_required_prop_types(): array;

	public function get_supported_properties(): array;
}
