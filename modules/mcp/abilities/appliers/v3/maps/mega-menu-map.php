<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Background_Group;
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

$hover = 'hover';
$active = 'active';

$titles = Style_Target::make( 'titles' )
	->label( 'Menu item titles; open title fill and text are the active state' )
	->selector( '.e-n-menu-title' )
	->states( $active )
	->with( Typography_Group::from_prefix( 'menu_item_title_typography' ) )
	->with( Background_Group::from_prefix( 'menu_item_title_background_color' ) )
	->with( Background_Group::from_prefix( 'menu_item_title_background_color_hover', $hover ) )
	->with( Background_Group::from_prefix( 'menu_item_title_background_color_active', $active ) )
	->bind( 'color', V3_Control::bind_to( 'menu_item_title_text_color_normal' ) )
	->bind( 'color', V3_Control::bind_to( 'menu_item_title_text_color_hover' ), $hover )
	->bind( 'color', V3_Control::bind_to( 'menu_item_title_text_color_active' ), $active )
	->bind( 'padding', V3_Control::bind_to( 'menu_item_title_padding' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'menu_item_title_border_radius' )->responsive() );

$panel = Style_Target::make( 'panel' )
	->label( 'Open dropdown panel, the container child of the active item' )
	->selector( '.e-n-menu-content > .e-con' )
	->with( Background_Group::from_prefix( 'content_background_color' ) )
	->with( Border_Group::from_prefix( 'content_border' ) )
	->with( Box_Shadow_Group::from_prefix( 'content_shadow' ) )
	->bind( 'padding', V3_Control::bind_to( 'content_padding' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'content_border_radius' )->responsive() );

return V3_Widget_Map::make( 'mega-menu' )
	->description( 'Menu whose dropdown panels are child containers, one per item, in the same order. `items` replaces the whole list. Each item is { title, link: { url, is_external, nofollow }, dropdown }. dropdown true shows that index\'s container, and only when the container has elements. Add the containers with build-composition parent_id set to this widget\'s element id (or nest <container> under <mega-menu>). Put the panel content inside the container.' )
	->settings( [
		'menu_name' => V3_Setting::bind_to( 'menu_name' )->string(),
		'items' => V3_Setting::bind_to( 'menu_items' )->repeater( [
			'title' => V3_Setting::bind_to( 'item_title' )->string(),
			'link' => V3_Setting::bind_to( 'item_link' )->link(),
			'dropdown' => V3_Setting::bind_to( 'item_dropdown_content' )->switcher(),
		] ),
		'content_width' => V3_Setting::bind_to( 'content_width' )->enum_from_control(),
		'item_layout' => V3_Setting::bind_to( 'item_layout' )->enum_from_control(),
		'item_position_horizontal' => V3_Setting::bind_to( 'item_position_horizontal' )->enum_from_control(),
		'open_on' => V3_Setting::bind_to( 'open_on' )->enum_from_control(),
	] )
	->default_target( $titles )
	->targets( $panel );
