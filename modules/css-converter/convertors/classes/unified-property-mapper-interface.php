<?php
namespace Elementor\Modules\CssConverter\Convertors\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Unified_Property_Mapper_Interface extends Class_Property_Mapper_Interface {

	public function map_to_v4_atomic( string $property, $value ): ?array;

	public function get_v4_property_name( string $css_property ): string;

	public function supports_v4_conversion( string $property, $value ): bool;
}
