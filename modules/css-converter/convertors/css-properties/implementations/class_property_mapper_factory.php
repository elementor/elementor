<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Property_Mapper_Factory {
	private static ?Class_Property_Mapper_Registry $registry = null;

	public static function get_registry(): Class_Property_Mapper_Registry {
		if ( null === self::$registry ) {
			self::$registry = new Class_Property_Mapper_Registry();
		}
		
		return self::$registry;
	}

	public static function create_mapper( string $property ): ?object {
		return self::get_registry()->resolve( $property );
	}

	public static function get_supported_properties(): array {
		return self::get_registry()->get_supported_properties();
	}

	public static function supports_property( string $property ): bool {
		return self::get_registry()->supports_property( $property );
	}

	public static function convert_property( string $property, string $value ): ?array {
		$mapper = self::get_registry()->resolve( $property );
		if ( null !== $mapper && method_exists( $mapper, 'map_to_v4_atomic' ) ) {
			return $mapper->map_to_v4_atomic( $property, $value );
		}
		
		return null;
	}

	public static function get_statistics(): array {
		return self::get_registry()->get_statistics();
	}

	public static function get_mapper_count(): int {
		$stats = self::get_statistics();
		return $stats['total_mappers'] ?? 0;
	}

	public static function get_property_count(): int {
		$stats = self::get_statistics();
		return $stats['supported_properties'] ?? 0;
	}

	public static function reset(): void {
		self::$registry = null;
		Class_Property_Mapper_Registry::reset_instance();
	}

	public static function initialize(): void {
		self::get_registry();
	}
}
