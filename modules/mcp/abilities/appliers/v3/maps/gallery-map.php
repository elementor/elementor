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
	->description( 'Each image cell of the gallery. gallery_layout, columns and aspect_ratio set the arrangement; with link_to set, each cell is a link.' )
	->selector( '.e-gallery-item' )
	->bind( 'border-color', V3_Control::bind_to( 'image_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( 'image_border_color_hover' ), $hover )
	->bind( 'border-width', V3_Control::bind_to( 'image_border_width' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius_hover' ), $hover );

$grid = Style_Target::make( 'grid' )
	->label( 'Gallery grid' )
	->description( 'The container that lays out the images. gap is the space between images.' )
	->selector( '.elementor-gallery__container' )
	->bind( 'gap', V3_Control::bind_to( 'gap' )->responsive() );

$overlay = Style_Target::make( 'overlay' )
	->label( 'Image overlay' )
	->description( 'Layer over each image that holds the overlay title and description. Rendered only while overlay_background is on. The default state is always visible, and hover sets the color shown while the pointer is over an image. padding is the space around the title and description, applied evenly on all sides.' )
	->selector( '.elementor-gallery-item__overlay' )
	->bind( 'background', V3_Control::bind_to( 'overlay_background_color' )->requires( [ 'overlay_background_background' => $classic ] ) )
	->bind( 'background', V3_Control::bind_to( 'overlay_background_hover_color' )->requires( [ 'overlay_background_hover_background' => $classic ] ), $hover )
	->bind( 'padding', V3_Control::bind_to( 'content_padding' )->responsive() );

$title_target = Style_Target::make( 'title' )
	->label( 'Overlay title' )
	->description( 'Title on the image overlay, taken from the image field chosen by overlay_title (title, caption, alt or description). Not rendered while overlay_title is empty.' )
	->selector( '.elementor-gallery-item__title' )
	->defaults( [ 'color' => '#fff' ] )
	->with( Typography_Group::from_prefix( 'title_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'title_color' ) );

$description = Style_Target::make( 'description' )
	->label( 'Overlay description' )
	->description( 'Second line on the image overlay, taken from the image field chosen by overlay_description. Not rendered while overlay_description is empty.' )
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
