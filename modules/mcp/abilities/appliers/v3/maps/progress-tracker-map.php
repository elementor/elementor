<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$classic = 'classic';

$progress = Style_Target::make( 'progress' )
	->label( 'Filled part of the horizontal tracker' )
	->selector( '.current-progress' )
	->defaults( [ 'background-color' => '#61ce70' ] )
	->bind( 'background', V3_Control::bind_to( 'horizontal_color_color' )->requires( [ 'horizontal_color_background' => $classic ] ) )
	->bind( 'border-style', V3_Control::bind_to( 'horizontal_border_style' ) )
	->bind( 'border-width', V3_Control::bind_to( 'horizontal_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'horizontal_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'horizontal_border_radius' )->responsive() );

$track = Style_Target::make( 'track' )
	->label( 'Horizontal tracker bar behind the progress' )
	->selector( '.elementor-scrolling-tracker-horizontal' )
	->defaults( [ 'background-color' => '#eee' ] )
	->with( Box_Shadow_Group::from_prefix( 'box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'horizontal_background_color_color' )->requires( [ 'horizontal_background_color_background' => $classic ] ) )
	->bind( 'height', V3_Control::bind_to( 'horizontal_height' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'horizontal_padding' )->responsive() )
	->bind( 'border-style', V3_Control::bind_to( 'horizontal_tracker_border_style' ) )
	->bind( 'border-width', V3_Control::bind_to( 'horizontal_tracker_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'horizontal_tracker_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'horizontal_tracker_border_radius' )->responsive() );

$circle = Style_Target::make( 'circle' )
	->label( 'Circular tracker: width is the circle size, color the progress ring, background the ring behind it' )
	->selector( '.elementor-scrolling-tracker-circular' )
	->bind( 'width', V3_Control::bind_to( 'circular_size' )->responsive() )
	->bind( 'color', V3_Control::bind_to( 'circular_color' ) )
	->bind( 'background', V3_Control::bind_to( 'circular_background_color' ) );

$percentage = Style_Target::make( 'percentage' )
	->label( 'Percentage text' )
	->selector( '.current-progress-percentage' )
	->with( Typography_Group::from_prefix( 'percentage_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'percentage_color' ) );

return V3_Widget_Map::make( 'progress-tracker' )
	->description( 'Reading progress indicator that fills as the visitor scrolls the page, the post content or a chosen element; horizontal bar or circle.' )
	->settings( [
		'type' => V3_Setting::bind_to( 'type' )->enum_from_control(),
		'relative_to' => V3_Setting::bind_to( 'relative_to' )->enum_from_control(),
		'selector' => V3_Setting::bind_to( 'selector' )->string(),
		'percentage' => V3_Setting::bind_to( 'percentage' )->switcher(),
	] )
	->default_target( $progress )
	->targets( $track, $circle, $percentage );
