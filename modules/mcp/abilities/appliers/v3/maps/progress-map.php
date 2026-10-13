<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$title = Style_Target::make( 'title' )
	->label( 'Progress bar title above the track' )
	->with( Typography_Group::from_prefix( 'typography' ) )
	->bind( 'color', V3_Control::bind_to( 'title_color' ) );

$bar = Style_Target::make( 'bar' )
	->label( 'Filled progress track' )
	->bind( 'background', V3_Control::bind_to( 'bar_color' ) )
	->bind( 'height', V3_Control::bind_to( 'bar_height' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'bar_border_radius' )->responsive() );

$track = Style_Target::make( 'track' )
	->label( 'Unfilled progress background' )
	->bind( 'background', V3_Control::bind_to( 'bar_bg_color' ) );

$inner = Style_Target::make( 'inner-text' )
	->label( 'Text inside the filled bar' )
	->with( Typography_Group::from_prefix( 'bar_inner_typography' )->except( 'line-height' ) )
	->bind( 'color', V3_Control::bind_to( 'bar_inline_color' ) );

return V3_Widget_Map::make( 'progress' )
	->description( 'Horizontal skill or percentage bar with optional title and inner label.' )
	->settings( [
		'title' => V3_Setting::bind_to( 'title' )->string(),
		'title_tag' => V3_Setting::bind_to( 'title_tag' )->enum_from_control(),
		'title_display' => V3_Setting::bind_to( 'title_display' )->switcher(),
		'percent' => V3_Setting::bind_to( 'percent' )->string(),
		'display_percentage' => V3_Setting::bind_to( 'display_percentage' )->switcher(),
		'inner_text' => V3_Setting::bind_to( 'inner_text' )->string(),
	] )
	->default_target( $bar )
	->targets( $title, $track, $inner );
