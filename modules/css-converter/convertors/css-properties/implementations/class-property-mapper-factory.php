<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Color_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Size_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Weight_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Align_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Line_Height_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Decoration_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Transform_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Display_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Dimension_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Opacity_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Padding_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Width_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Style_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Color_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Radius_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Zero_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Shorthand_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Color_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Image_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Gradient_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Filter_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Flex_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Position_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Shadow_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Stroke_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Transition_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Box_Shadow_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Registry;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

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
			new Border_Zero_Property_Mapper(),
			new Border_Shorthand_Property_Mapper(),
			new Background_Color_Property_Mapper(),
			new Background_Image_Property_Mapper(),
			new Background_Gradient_Property_Mapper(),
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
			if ( $mapper instanceof Property_Mapper_Interface ) {
				self::$registry->register( $mapper );
			}
		}
	}

	public static function reset_registry(): void {
		self::$registry = null;
	}
}
