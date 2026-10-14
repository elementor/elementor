<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$images = Style_Target::make( 'images' )
	->label( 'Gallery images' )
	->selector( '.gallery-item img' )
	->with( Border_Group::from_prefix( 'image_border' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() );

$grid = Style_Target::make( 'grid' )
	->label( 'Gallery grid; gap is the space between images' )
	->selector( '.gallery' )
	->bind( 'gap', V3_Control::bind_to( 'image_spacing_custom' ) );

$caption = Style_Target::make( 'caption' )
	->label( 'Image captions' )
	->selector( '.gallery-item .gallery-caption' )
	->with( Typography_Group::from_prefix( 'typography' ) )
	->bind( 'color', V3_Control::bind_to( 'text_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive() )
	->bind( 'margin', V3_Control::bind_to( 'caption_space' )->responsive()->sides( 'block-start' ) );

return V3_Widget_Map::make( 'image-gallery' )
	->description( 'WordPress-style grid of Media Library images, with optional captions and lightbox.' )
	->settings( [
		'wp_gallery' => V3_Setting::bind_to( 'wp_gallery' )->gallery(),
		'thumbnail_size' => V3_Setting::bind_to( 'thumbnail_size' )->enum_from_control(),
		'gallery_columns' => V3_Setting::bind_to( 'gallery_columns' )->enum_from_control(),
		'gallery_display_caption' => V3_Setting::bind_to( 'gallery_display_caption' )->enum_from_control(),
		'gallery_link' => V3_Setting::bind_to( 'gallery_link' )->enum_from_control(),
		'open_lightbox' => V3_Setting::bind_to( 'open_lightbox' )->enum_from_control(),
		'gallery_rand' => V3_Setting::bind_to( 'gallery_rand' )->enum_from_control(),
	] )
	->default_target( $images )
	->targets( $grid, $caption );
