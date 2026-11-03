<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$image = Style_Target::make( 'image' )
	->label( 'Featured image' )
	->description( 'The featured image of the current post. Not rendered when the post has no featured image. text-align places the image inside the widget. object-fit applies only while height is set.' )
	->selector( 'img' )
	->with( Border_Group::from_prefix( 'image_border' ) )
	->with( Box_Shadow_Group::from_prefix( 'image_box_shadow' ) )
	->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive() )
	->bind( 'width', V3_Control::bind_to( 'width' )->responsive() )
	->bind( 'max-width', V3_Control::bind_to( 'space' )->responsive() )
	->bind( 'height', V3_Control::bind_to( 'height' )->responsive() )
	->bind( 'object-fit', V3_Control::bind_to( 'object-fit' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() );

$caption = Style_Target::make( 'caption' )
	->label( 'Caption' )
	->description( 'Text under the image. Only rendered while caption_source is not none and the chosen caption is not empty.' )
	->selector( '.widget-image-caption' )
	->with( Typography_Group::from_prefix( 'caption_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'text_color' ) )
	->bind( 'background', V3_Control::bind_to( 'caption_background_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'caption_align' )->responsive() )
	->bind( 'margin', V3_Control::bind_to( 'caption_space' )->responsive()->sides( 'block-start' ) );

return V3_Widget_Map::make( 'theme-post-featured-image' )
	->description( 'Featured image of the current post, for single post and loop templates. The image comes from the post, so it is not set here. Prefer `e-image` with a `featured-image` dynamic tag on `src`; use this V3 widget only when the V4 equivalent is not viable.' )
	->settings( [
		'image_size' => V3_Setting::bind_to( 'image_size' )->enum_from_control(),
		'caption_source' => V3_Setting::bind_to( 'caption_source' )->enum_from_control(),
		'caption' => V3_Setting::bind_to( 'caption' )->string()->dynamic(),
		'link_to' => V3_Setting::bind_to( 'link_to' )->enum_from_control(),
		'link' => V3_Setting::bind_to( 'link' )->link()->dynamic(),
		'open_lightbox' => V3_Setting::bind_to( 'open_lightbox' )->enum_from_control(),
	] )
	->default_target( $image )
	->targets( $caption );
