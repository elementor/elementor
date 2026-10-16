<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bar = Style_Target::make( 'bar' )
	->label( 'Filled part of the bar; color and typography apply to the inner text' )
	->selector( '.elementor-progress-bar' )
	->with( Typography_Group::from_prefix( 'bar_inner_typography' )->except( 'line-height' ) )
	->bind( 'background', V3_Control::bind_to( 'bar_color' ) )
	->bind( 'height', V3_Control::bind_to( 'bar_height' ) )
	->bind( 'color', V3_Control::bind_to( 'bar_inline_color' ) );

$track = Style_Target::make( 'track' )
	->label( 'Unfilled track behind the bar' )
	->selector( '.elementor-progress-wrapper' )
	->bind( 'background', V3_Control::bind_to( 'bar_bg_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'bar_border_radius' ) );

$title = Style_Target::make( 'title' )
	->label( 'Title above the bar' )
	->selector( '.elementor-title' )
	->with( Typography_Group::from_prefix( 'typography' ) )
	->bind( 'color', V3_Control::bind_to( 'title_color' ) );

return V3_Widget_Map::make( 'progress' )
	->description( 'Progress bar showing a percentage, with optional title and inner text.' )
	->settings( [
		'title' => V3_Setting::bind_to( 'title' )->string()->dynamic(),
		'title_tag' => V3_Setting::bind_to( 'title_tag' )->enum_from_control()->default( 'span' ),
		'title_display' => V3_Setting::bind_to( 'title_display' )->switcher(),
		'percent' => V3_Setting::bind_to( 'percent' )->size()->dynamic(),
		'display_percentage' => V3_Setting::bind_to( 'display_percentage' )->switcher(),
		'inner_text' => V3_Setting::bind_to( 'inner_text' )->string()->dynamic(),
	] )
	->default_target( $bar )
	->targets( $track, $title );
