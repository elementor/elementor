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
	->label( 'Animated counter number (prefix, number, suffix)' )
	->with( Typography_Group::from_prefix( 'typography_number' ) )
	->bind( 'color', V3_Control::bind_to( 'number_color' ) );

$title = Style_Target::make( 'title' )
	->label( 'Counter title below or beside the number' )
	->with( Typography_Group::from_prefix( 'typography_title' ) )
	->bind( 'color', V3_Control::bind_to( 'title_color' ) );

return V3_Widget_Map::make( 'counter' )
	->description( 'Animated number counter with optional title, prefix, and suffix.' )
	->settings( [
		'starting_number' => V3_Setting::bind_to( 'starting_number' )->string(),
		'ending_number' => V3_Setting::bind_to( 'ending_number' )->string(),
		'prefix' => V3_Setting::bind_to( 'prefix' )->string(),
		'suffix' => V3_Setting::bind_to( 'suffix' )->string(),
		'duration' => V3_Setting::bind_to( 'duration' )->string(),
		'thousand_separator' => V3_Setting::bind_to( 'thousand_separator' )->switcher(),
		'thousand_separator_char' => V3_Setting::bind_to( 'thousand_separator_char' )->enum_from_control(),
		'title' => V3_Setting::bind_to( 'title' )->string(),
		'title_tag' => V3_Setting::bind_to( 'title_tag' )->enum_from_control(),
	] )
	->default_target( $number )
	->targets( $title );
