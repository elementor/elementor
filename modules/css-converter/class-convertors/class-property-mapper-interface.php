<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Class_Property_Mapper_Interface {
	public function supports( string $property, $value ): bool;
	public function map_to_schema( string $property, $value ): array;
	public function get_supported_properties(): array;
}
