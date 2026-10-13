<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$image = Style_Target::make( 'image' )
	->label( 'Carousel slide images' )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() );

$navigation = Style_Target::make( 'navigation' )
	->label( 'Arrows and dots' )
	->bind( 'color', V3_Control::bind_to( 'arrows_color' ) )
	->bind( 'background', V3_Control::bind_to( 'dots_color' ) );

return V3_Widget_Map::make( 'image-carousel' )
	->description( 'Swiper image slider. Add images in the editor; control navigation and slide layout here.' )
	->settings( [
		'carousel_name' => V3_Setting::bind_to( 'carousel_name' )->string(),
		'navigation' => V3_Setting::bind_to( 'navigation' )->enum_from_control(),
		'image_stretch' => V3_Setting::bind_to( 'image_stretch' )->enum_from_control(),
		'slides_to_show' => V3_Setting::bind_to( 'slides_to_show' )->enum_from_control(),
		'image_spacing' => V3_Setting::bind_to( 'image_spacing' )->enum_from_control(),
	] )
	->default_target( $image )
	->targets( $navigation );
