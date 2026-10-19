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
	->label( 'Progress fill' )
	->description( 'The part of the horizontal bar that fills as the visitor scrolls, measured against relative_to. Applies only while type is horizontal. Hidden until the visitor scrolls, so a preview at the top of the page shows an empty bar.' )
	->selector( '.current-progress' )
	->defaults( [ 'background-color' => '#61ce70' ] )
	->bind( 'background', V3_Control::bind_to( 'horizontal_color_color' )->requires( [ 'horizontal_color_background' => $classic ] ) )
	->bind( 'border-style', V3_Control::bind_to( 'horizontal_border_style' ) )
	->bind( 'border-width', V3_Control::bind_to( 'horizontal_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'horizontal_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'horizontal_border_radius' )->responsive() );

$track = Style_Target::make( 'track' )
	->label( 'Track bar' )
	->description( 'The full-width bar behind the progress fill. Applies only while type is horizontal.' )
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

$circular = [ 'type' => 'circular' ];

$circle = Style_Target::make( 'circle' )
	->label( 'Progress circle' )
	->description( 'The circle that fills as the visitor scrolls. Applies only while type is circular. width is the circle diameter, color is the filled part and background is the track behind it. The fill is hidden until the visitor scrolls.' )
	->selector( '' )
	->bind( 'width', V3_Control::bind_to( 'circular_size' )->responsive()->requires( $circular ) )
	->bind( 'color', V3_Control::bind_to( 'circular_color' )->requires( $circular ) )
	->bind( 'background', V3_Control::bind_to( 'circular_background_color' )->requires( $circular ) );

$percentage = Style_Target::make( 'percentage' )
	->label( 'Percentage' )
	->description( 'The scroll percentage shown on the tracker while percentage is on. On the horizontal bar the text only shows once the fill is wide enough to hold it.' )
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
