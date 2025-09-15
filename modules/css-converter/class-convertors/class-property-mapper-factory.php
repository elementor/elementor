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
require_once __DIR__ . '/margin-property-mapper.php';
require_once __DIR__ . '/padding-property-mapper.php';
require_once __DIR__ . '/border-width-property-mapper.php';
require_once __DIR__ . '/border-style-property-mapper.php';
require_once __DIR__ . '/border-color-property-mapper.php';
require_once __DIR__ . '/border-radius-property-mapper.php';
require_once __DIR__ . '/background-color-property-mapper.php';
require_once __DIR__ . '/background-image-property-mapper.php';
require_once __DIR__ . '/background-property-mapper.php';
require_once __DIR__ . '/filter-property-mapper.php';
require_once __DIR__ . '/flex-property-mapper.php';
require_once __DIR__ . '/position-property-mapper.php';
require_once __DIR__ . '/shadow-property-mapper.php';
require_once __DIR__ . '/stroke-property-mapper.php';
require_once __DIR__ . '/transition-property-mapper.php';
require_once __DIR__ . '/box-shadow-property-mapper.php';

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
			new Margin_Property_Mapper(),
			new Padding_Property_Mapper(),
			new Border_Width_Property_Mapper(),
			new Border_Style_Property_Mapper(),
			new Border_Color_Property_Mapper(),
			new Border_Radius_Property_Mapper(),
			new Background_Color_Property_Mapper(),
			new Background_Image_Property_Mapper(),
			new Background_Property_Mapper(),
			new Filter_Property_Mapper(),
			new Flex_Property_Mapper(),
			new Position_Property_Mapper(),
			new Shadow_Property_Mapper(),
			new Stroke_Property_Mapper(),
			new Transition_Property_Mapper(),
			new Box_Shadow_Property_Mapper(),
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
