<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$number = Style_Target::make( 'number' )
	->label( 'Animated number, including its prefix and suffix' )
	->selector( '.elementor-counter-number-wrapper' )
	->with( Typography_Group::from_prefix( 'typography_number' ) )
	->bind( 'color', V3_Control::bind_to( 'number_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'number_position' )->responsive() )
	->bind( 'gap', V3_Control::bind_to( 'number_gap' )->responsive() );

$title_target = Style_Target::make( 'title' )
	->label( 'Title shown next to the number' )
	->selector( '.elementor-counter-title' )
	->defaults( [ 'line-height' => '2.5' ] )
	->with( Typography_Group::from_prefix( 'typography_title' ) )
	->bind( 'color', V3_Control::bind_to( 'title_color' ) );

$layout = Style_Target::make( 'layout' )
	->label( 'Number and title layout; gap is the space between them' )
	->selector( '.elementor-counter' )
	->bind( 'gap', V3_Control::bind_to( 'title_gap' )->responsive() );

return V3_Widget_Map::make( 'counter' )
	->description( 'Animated number that counts from a starting to an ending value, with optional prefix, suffix and title.' )
	->settings( [
		'starting_number' => V3_Setting::bind_to( 'starting_number' )->number()->dynamic(),
		'ending_number' => V3_Setting::bind_to( 'ending_number' )->number()->dynamic(),
		'prefix' => V3_Setting::bind_to( 'prefix' )->string()->dynamic(),
		'suffix' => V3_Setting::bind_to( 'suffix' )->string()->dynamic(),
		'duration' => V3_Setting::bind_to( 'duration' )->number(),
		'thousand_separator' => V3_Setting::bind_to( 'thousand_separator' )->switcher(),
		'title' => V3_Setting::bind_to( 'title' )->string()->dynamic(),
		'title_tag' => V3_Setting::bind_to( 'title_tag' )->enum_from_control()->default( 'div' ),
		'title_position' => V3_Setting::bind_to( 'title_position' )->enum_from_control(),
	] )
	->default_target( $number )
	->targets( $title_target, $layout );
