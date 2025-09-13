<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/font-weight-property-mapper.php';
require_once __DIR__ . '/text-align-property-mapper.php';
require_once __DIR__ . '/line-height-property-mapper.php';
require_once __DIR__ . '/text-decoration-property-mapper.php';
require_once __DIR__ . '/text-transform-property-mapper.php';
require_once __DIR__ . '/display-property-mapper.php';
require_once __DIR__ . '/dimension-property-mapper.php';
require_once __DIR__ . '/opacity-property-mapper.php';

class Class_Property_Mapper_Factory {
	private static $registry = null;

	public static function get_registry(): Class_Property_Mapper_Registry {
		// Force reinitialize for now to ensure new mappers are loaded
		self::$registry = new Class_Property_Mapper_Registry();
		self::init_default_mappers();
		
		return self::$registry;
	}

	private static function init_default_mappers(): void {
		$mappers = [
			new Color_Property_Mapper(),
			new Font_Size_Property_Mapper(),
			new Font_Weight_Property_Mapper(),
			new Text_Align_Property_Mapper(),
			new Line_Height_Property_Mapper(),
			new Text_Decoration_Property_Mapper(),
			new Text_Transform_Property_Mapper(),
			new Display_Property_Mapper(),
			new Dimension_Property_Mapper(),
			new Opacity_Property_Mapper(),
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
