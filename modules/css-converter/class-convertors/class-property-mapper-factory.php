<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Property_Mapper_Factory {
	private static $registry = null;

	public static function get_registry(): Class_Property_Mapper_Registry {
		if ( null === self::$registry ) {
			self::$registry = new Class_Property_Mapper_Registry();
			self::init_default_mappers();
		}
		
		return self::$registry;
	}

	private static function init_default_mappers(): void {
		$mappers = [
			new Color_Property_Mapper(),
			new Font_Size_Property_Mapper(),
		];

		$mappers = apply_filters( 'elementor_css_converter_property_mappers', $mappers );

		foreach ( $mappers as $mapper ) {
			if ( $mapper instanceof Class_Property_Mapper_Interface ) {
				self::$registry->register( $mapper );
			}
		}
	}

	public static function reset_registry(): void {
		self::$registry = null;
	}
}
