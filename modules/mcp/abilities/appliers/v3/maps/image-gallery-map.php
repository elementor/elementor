<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$image = Style_Target::make( 'image' )
	->label( 'Gallery grid images' )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() )
	->bind( 'gap', V3_Control::bind_to( 'image_spacing_custom' )->responsive() );

$caption = Style_Target::make( 'caption' )
	->label( 'Image captions when enabled' )
	->bind( 'color', V3_Control::bind_to( 'text_color' ) );

return V3_Widget_Map::make( 'image-gallery' )
	->description( 'WordPress basic gallery grid (core). Add images in the editor or via dynamic gallery control.' )
	->settings( [
		'gallery_columns' => V3_Setting::bind_to( 'gallery_columns' )->enum_from_control(),
		'gallery_link' => V3_Setting::bind_to( 'gallery_link' )->enum_from_control(),
		'gallery_display_caption' => V3_Setting::bind_to( 'gallery_display_caption' )->enum_from_control(),
		'open_lightbox' => V3_Setting::bind_to( 'open_lightbox' )->enum_from_control(),
		'gallery_rand' => V3_Setting::bind_to( 'gallery_rand' )->enum_from_control(),
		'image_spacing' => V3_Setting::bind_to( 'image_spacing' )->enum_from_control(),
	] )
	->default_target( $image )
	->targets( $caption );
