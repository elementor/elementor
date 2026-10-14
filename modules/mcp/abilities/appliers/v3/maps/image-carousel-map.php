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

$inactive = 'inactive';

$images = Style_Target::make( 'images' )
	->label( 'Slide images' )
	->selector( '.elementor-image-carousel-wrapper .elementor-image-carousel .swiper-slide-image' )
	->with( Border_Group::from_prefix( 'image_border' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() );

$arrows = Style_Target::make( 'arrows' )
	->label( 'Previous and next arrows' )
	->selector( '.elementor-swiper-button' )
	->bind( 'font-size', V3_Control::bind_to( 'arrows_size' )->responsive() )
	->bind( 'color', V3_Control::bind_to( 'arrows_color' ) );

$dots = Style_Target::make( 'dots' )
	->label( 'Pagination dots; background is the dot color, dots:inactive styles the dots of other slides' )
	->selector( '.swiper-pagination-bullet' )
	->states( $inactive )
	->bind( 'width', V3_Control::bind_to( 'dots_size' )->responsive() )
	->bind( 'background', V3_Control::bind_to( 'dots_color' ) )
	->bind( 'background', V3_Control::bind_to( 'dots_inactive_color' ), $inactive );

$caption = Style_Target::make( 'caption' )
	->label( 'Slide captions' )
	->selector( '.elementor-image-carousel-caption' )
	->with( Typography_Group::from_prefix( 'caption_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'caption_text_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'caption_align' )->responsive() )
	->bind( 'margin', V3_Control::bind_to( 'caption_space' )->responsive()->sides( 'block-start' ) );

return V3_Widget_Map::make( 'image-carousel' )
	->description( 'Sliding carousel of Media Library images with arrows, dots, autoplay and optional captions or links.' )
	->settings( [
		'carousel' => V3_Setting::bind_to( 'carousel' )->gallery(),
		'thumbnail_size' => V3_Setting::bind_to( 'thumbnail_size' )->enum_from_control(),
		'slides_to_show' => V3_Setting::bind_to( 'slides_to_show' )->enum_from_control(),
		'slides_to_scroll' => V3_Setting::bind_to( 'slides_to_scroll' )->enum_from_control(),
		'image_stretch' => V3_Setting::bind_to( 'image_stretch' )->enum_from_control(),
		'navigation' => V3_Setting::bind_to( 'navigation' )->enum_from_control(),
		'navigation_previous_icon' => V3_Setting::bind_to( 'navigation_previous_icon' )->icons(),
		'navigation_next_icon' => V3_Setting::bind_to( 'navigation_next_icon' )->icons(),
		'link_to' => V3_Setting::bind_to( 'link_to' )->enum_from_control(),
		'link' => V3_Setting::bind_to( 'link' )->link(),
		'open_lightbox' => V3_Setting::bind_to( 'open_lightbox' )->enum_from_control(),
		'caption_type' => V3_Setting::bind_to( 'caption_type' )->enum_from_control(),
		'autoplay' => V3_Setting::bind_to( 'autoplay' )->switcher(),
		'autoplay_speed' => V3_Setting::bind_to( 'autoplay_speed' )->number(),
		'pause_on_hover' => V3_Setting::bind_to( 'pause_on_hover' )->switcher(),
		'pause_on_interaction' => V3_Setting::bind_to( 'pause_on_interaction' )->switcher(),
		'infinite' => V3_Setting::bind_to( 'infinite' )->switcher(),
		'effect' => V3_Setting::bind_to( 'effect' )->enum_from_control(),
		'speed' => V3_Setting::bind_to( 'speed' )->number(),
		'lazyload' => V3_Setting::bind_to( 'lazyload' )->switcher(),
		'direction' => V3_Setting::bind_to( 'direction' )->enum_from_control(),
	] )
	->default_target( $images )
	->targets( $arrows, $dots, $caption );
