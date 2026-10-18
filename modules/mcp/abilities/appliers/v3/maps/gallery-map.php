<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hover = 'hover';
$classic = 'classic';

$images = Style_Target::make( 'images' )
	->label( 'Gallery images' )
	->selector( '.e-gallery-item' )
	->bind( 'border-color', V3_Control::bind_to( 'image_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( 'image_border_color_hover' ), $hover )
	->bind( 'border-width', V3_Control::bind_to( 'image_border_width' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius_hover' ), $hover );

$grid = Style_Target::make( 'grid' )
	->label( 'Gallery grid; gap is the space between images' )
	->selector( '.elementor-gallery__container' )
	->bind( 'gap', V3_Control::bind_to( 'gap' )->responsive() );

$overlay = Style_Target::make( 'overlay' )
	->label( 'Overlay over each image. The default state is always visible; the hover state is the color on hover. Padding sets the --content-padding variable on the widget (uniform space around title and description)' )
	->selector( '.elementor-gallery-item__overlay' )
	->bind( 'background', V3_Control::bind_to( 'overlay_background_color' )->requires( [ 'overlay_background_background' => $classic ] ) )
	->bind( 'background', V3_Control::bind_to( 'overlay_background_hover_color' )->requires( [ 'overlay_background_hover_background' => $classic ] ), $hover )
	->bind( 'padding', V3_Control::bind_to( 'content_padding' )->responsive() );

$title_target = Style_Target::make( 'title' )
	->label( 'Overlay title' )
	->selector( '.elementor-gallery-item__title' )
	->defaults( [ 'color' => '#fff' ] )
	->with( Typography_Group::from_prefix( 'title_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'title_color' ) );

$description = Style_Target::make( 'description' )
	->label( 'Overlay description' )
	->selector( '.elementor-gallery-item__description' )
	->defaults( [ 'color' => '#fff' ] )
	->with( Typography_Group::from_prefix( 'description_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'description_color' ) );

return V3_Widget_Map::make( 'gallery' )
	->description( 'Grid, justified or masonry gallery of Media Library images with hover overlays and lightbox.' )
	->settings( [
		'gallery_type' => V3_Setting::bind_to( 'gallery_type' )->enum_from_control(),
		'gallery' => V3_Setting::bind_to( 'gallery' )->gallery(),
		'gallery_layout' => V3_Setting::bind_to( 'gallery_layout' )->enum_from_control(),
		'columns' => V3_Setting::bind_to( 'columns' )->number(),
		'aspect_ratio' => V3_Setting::bind_to( 'aspect_ratio' )->enum_from_control(),
		'link_to' => V3_Setting::bind_to( 'link_to' )->enum_from_control(),
		'url' => V3_Setting::bind_to( 'url' )->link(),
		'overlay_background' => V3_Setting::bind_to( 'overlay_background' )->switcher(),
		'overlay_title' => V3_Setting::bind_to( 'overlay_title' )->enum_from_control(),
		'overlay_description' => V3_Setting::bind_to( 'overlay_description' )->enum_from_control(),
	] )
	->default_target( $images )
	->targets( $grid, $overlay, $title_target, $description );
