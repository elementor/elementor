<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Property_Mapper_Interface {
	public function supports( string $property, $value ): bool;
	
	public function get_supported_properties(): array;
	
	public function map_to_schema( string $property, $value ): array;
	
	public function map_to_v4_atomic( string $property, $value ): ?array;
}
