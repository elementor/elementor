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

$hover = 'hover';
$current = 'current';

$main_menu = Style_Target::make( 'main-menu' )
	->label( 'Main menu items' )
	->states( $current )
	->with( Typography_Group::from_prefix( 'menu_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item' ) )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_hover' ), $hover )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_active' ), $current )
	->bind( 'padding', V3_Control::bind_to( 'padding_horizontal_menu_item' )->responsive()->sides( 'inline-start', 'inline-end' ) )
	->bind( 'padding', V3_Control::bind_to( 'padding_vertical_menu_item' )->responsive()->sides( 'block-start', 'block-end' ) )
	->bind( 'gap', V3_Control::bind_to( 'menu_space_between' )->responsive() );

$pointer = Style_Target::make( 'pointer' )
	->label( 'Main menu hover pointer (underline, overline, frame or background); color is the item text over a background pointer' )
	->states( $current )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_hover_pointer_bg' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_hover' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_active' ), $current )
	->bind( 'border-width', V3_Control::bind_to( 'pointer_width' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'border_radius_menu_item' )->responsive() );

$divider = Style_Target::make( 'divider' )
	->label( 'Divider between horizontal main menu items' )
	->bind( 'border-style', V3_Control::bind_to( 'nav_menu_divider_style' ) )
	->bind( 'border-width', V3_Control::bind_to( 'nav_menu_divider_weight' ) )
	->bind( 'height', V3_Control::bind_to( 'nav_menu_divider_height' ) )
	->bind( 'border-color', V3_Control::bind_to( 'nav_menu_divider_color' ) );

$dropdown = Style_Target::make( 'dropdown' )
	->label( 'Submenu on desktop, and the whole menu on mobile' )
	->states( $current )
	->with( Typography_Group::from_prefix( 'dropdown_typography' )->except( 'line-height' ) )
	->with( Border_Group::from_prefix( 'dropdown_border' ) )
	->with( Box_Shadow_Group::from_prefix( 'dropdown_box_shadow' ) )
	->bind( 'color', V3_Control::bind_to( 'color_dropdown_item' ) )
	->bind( 'color', V3_Control::bind_to( 'color_dropdown_item_hover' ), $hover )
	->bind( 'color', V3_Control::bind_to( 'color_dropdown_item_active' ), $current )
	->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item' ) )
	->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item_hover' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item_active' ), $current )
	->bind( 'border-radius', V3_Control::bind_to( 'dropdown_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'padding_horizontal_dropdown_item' )->responsive()->sides( 'inline-start', 'inline-end' ) )
	->bind( 'padding', V3_Control::bind_to( 'padding_vertical_dropdown_item' )->responsive()->sides( 'block-start', 'block-end' ) )
	->bind( 'margin', V3_Control::bind_to( 'dropdown_top_distance' )->responsive()->sides( 'block-start' ) );

$dropdown_divider = Style_Target::make( 'dropdown-divider' )
	->label( 'Divider between dropdown items' )
	->bind( 'border-style', V3_Control::bind_to( 'dropdown_divider_border' ) )
	->bind( 'border-color', V3_Control::bind_to( 'dropdown_divider_color' ) )
	->bind( 'border-width', V3_Control::bind_to( 'dropdown_divider_width' ) );

$toggle = Style_Target::make( 'toggle' )
	->label( 'Mobile menu toggle button' )
	->bind( 'color', V3_Control::bind_to( 'toggle_color' ) )
	->bind( 'color', V3_Control::bind_to( 'toggle_color_hover' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'toggle_background_color' ) )
	->bind( 'background', V3_Control::bind_to( 'toggle_background_color_hover' ), $hover )
	->bind( 'font-size', V3_Control::bind_to( 'toggle_size' )->responsive() )
	->bind( 'border-width', V3_Control::bind_to( 'toggle_border_width' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'toggle_border_radius' )->responsive() );

return V3_Widget_Map::make( 'nav-menu' )
	->description( 'WordPress menu rendered as a horizontal, vertical or dropdown navigation, with a mobile toggle button.' )
	->settings( [
		'menu_name' => V3_Setting::bind_to( 'menu_name' )->string(),
		'menu' => V3_Setting::bind_to( 'menu' )->string(),
		'layout' => V3_Setting::bind_to( 'layout' )->enum_from_control(),
		'align_items' => V3_Setting::bind_to( 'align_items' )->enum_from_control(),
		'pointer' => V3_Setting::bind_to( 'pointer' )->enum_from_control(),
		'animation_line' => V3_Setting::bind_to( 'animation_line' )->enum_from_control(),
		'animation_framed' => V3_Setting::bind_to( 'animation_framed' )->enum_from_control(),
		'animation_background' => V3_Setting::bind_to( 'animation_background' )->enum_from_control(),
		'animation_text' => V3_Setting::bind_to( 'animation_text' )->enum_from_control(),
		'submenu_icon' => V3_Setting::bind_to( 'submenu_icon' )->icons(),
		'dropdown' => V3_Setting::bind_to( 'dropdown' )->enum_from_control(),
		'full_width' => V3_Setting::bind_to( 'full_width' )->switcher(),
		'text_align' => V3_Setting::bind_to( 'text_align' )->enum_from_control(),
		'toggle' => V3_Setting::bind_to( 'toggle' )->enum_from_control(),
		'toggle_icon_normal' => V3_Setting::bind_to( 'toggle_icon_normal' )->icons(),
		'toggle_icon_hover_animation' => V3_Setting::bind_to( 'toggle_icon_hover_animation' )->string(),
		'toggle_icon_active' => V3_Setting::bind_to( 'toggle_icon_active' )->icons(),
		'toggle_align' => V3_Setting::bind_to( 'toggle_align' )->enum_from_control(),
		'nav_menu_divider' => V3_Setting::bind_to( 'nav_menu_divider' )->switcher(),
	] )
	->default_target( $main_menu )
	->targets( $pointer, $divider, $dropdown, $dropdown_divider, $toggle );
