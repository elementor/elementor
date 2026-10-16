<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hover = 'hover';

$icons = Style_Target::make( 'icons' )
	->label( 'Each icon button; background is the button color, color the glyph, font-size the icon size' )
	->selector( '.elementor-social-icon' )
	->with( Border_Group::from_prefix( 'image_border' ) )
	->bind( 'background', V3_Control::bind_to( 'icon_primary_color' ) )
	->bind( 'background', V3_Control::bind_to( 'hover_primary_color' ), $hover )
	->bind( 'color', V3_Control::bind_to( 'icon_secondary_color' ) )
	->bind( 'color', V3_Control::bind_to( 'hover_secondary_color' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'border_radius' )->responsive() )
	->bind( 'font-size', V3_Control::bind_to( 'icon_size' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'icon_padding' )->responsive()->sides( 'block-start', 'block-end', 'inline-start', 'inline-end' ) );

$grid = Style_Target::make( 'grid' )
	->label( 'Row of icons; column-gap is the space between icons' )
	->selector( '.elementor-social-icons-wrapper' )
	->bind( 'column-gap', V3_Control::bind_to( 'icon_spacing' )->responsive() )
	->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive() );

return V3_Widget_Map::make( 'social-icons' )
	->description( 'Row of linked social network icons. `social_icon_list` replaces the whole list; each item is { social_icon: { value, library }, link: { url, is_external, nofollow } }, e.g. { value: "fab fa-facebook", library: "fa-brands" }.' )
	->settings( [
		'social_icon_list' => V3_Setting::bind_to( 'social_icon_list' )->repeater(),
		'shape' => V3_Setting::bind_to( 'shape' )->enum_from_control(),
		'columns' => V3_Setting::bind_to( 'columns' )->enum_from_control(),
		'icon_color' => V3_Setting::bind_to( 'icon_color' )->enum_from_control(),
	] )
	->default_target( $icons )
	->targets( $grid );
