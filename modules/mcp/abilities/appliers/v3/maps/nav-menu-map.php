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
	->description( 'Top-level links of the menu, laid out by layout (horizontal or vertical). Not rendered when layout is dropdown, and hidden below the dropdown breakpoint, where the dropdown target shows the whole menu instead. The current state styles the link of the page being viewed.' )
	->selector( '.elementor-nav-menu--main .elementor-item' )
	->defaults( [
		'line-height' => '20px',
		'padding' => '10px 20px',
	] )
	->states( $current )
	->with( Typography_Group::from_prefix( 'menu_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item' ) )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_hover' ), $hover )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_active' ), $current )
	->bind( 'padding', V3_Control::bind_to( 'padding_horizontal_menu_item' )->responsive()->sides( 'inline-start', 'inline-end' ) )
	->bind( 'padding', V3_Control::bind_to( 'padding_vertical_menu_item' )->responsive()->sides( 'block-start', 'block-end' ) )
	->bind( 'gap', V3_Control::bind_to( 'menu_space_between' )->responsive() );

$pointer = Style_Target::make( 'pointer' )
	->label( 'Main menu hover pointer' )
	->description( 'Decoration drawn on a main menu item on hover and on the current item: an underline, overline, frame or background, chosen by pointer. Nothing shows while pointer is none or text. color is the item text color over a background pointer and only applies while pointer is background.' )
	->selector( '.elementor-nav-menu--main .elementor-item:before, .elementor-nav-menu--main .elementor-item:after' )
	->states( $current )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_hover_pointer_bg' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_hover' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_active' ), $current )
	->bind( 'border-width', V3_Control::bind_to( 'pointer_width' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'border_radius_menu_item' )->responsive() );

$divider = Style_Target::make( 'divider' )
	->label( 'Main menu divider' )
	->description( 'Separator line between top-level items. Shows only with layout horizontal and the widget Divider switch turned on in the Elementor editor; that switch is not a setting here, so these styles have no visible effect while it is off.' )
	->selector( '.elementor-nav-menu--layout-horizontal .elementor-nav-menu > li:not(:last-child):after' )
	->bind( 'border-style', V3_Control::bind_to( 'nav_menu_divider_style' ) )
	->bind( 'border-width', V3_Control::bind_to( 'nav_menu_divider_weight' ) )
	->bind( 'height', V3_Control::bind_to( 'nav_menu_divider_height' ) )
	->bind( 'border-color', V3_Control::bind_to( 'nav_menu_divider_color' ) );

$dropdown = Style_Target::make( 'dropdown' )
	->label( 'Dropdown menu' )
	->description( 'The submenus that open under top-level items on desktop, and the whole menu below the dropdown breakpoint, where it stays collapsed until the toggle button is clicked. With layout dropdown it is the only menu. Hidden entirely while dropdown is none. full_width stretches it to the page width. hover and current style its items.' )
	->selector( '.elementor-nav-menu--dropdown' )
	->defaults( [
		'font-size' => '13px',
		'background-color' => '#fff',
		'margin-top' => '10px',
	] )
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
	->label( 'Dropdown divider' )
	->description( 'Line between items of the dropdown menu, drawn as a bottom border on every item except the last. Shows only once border-style is set.' )
	->selector( '.elementor-nav-menu--dropdown li:not(:last-child)' )
	->bind( 'border-style', V3_Control::bind_to( 'dropdown_divider_border' ) )
	->bind( 'border-color', V3_Control::bind_to( 'dropdown_divider_color' ) )
	->bind( 'border-width', V3_Control::bind_to( 'dropdown_divider_width' ) );

$toggle = Style_Target::make( 'toggle' )
	->label( 'Mobile menu toggle' )
	->description( 'Hamburger button that opens and closes the dropdown menu below the dropdown breakpoint. Rendered only while toggle is burger, and hidden above the breakpoint or while dropdown is none. font-size is the icon size.' )
	->selector( '.elementor-menu-toggle' )
	->defaults( [
		'background-color' => 'rgba(0, 0, 0, .05)',
		'font-size' => '22px',
		'border-radius' => '3px',
	] )
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
		'menu' => V3_Setting::bind_to( 'menu' )->enum_from_control(),
		'layout' => V3_Setting::bind_to( 'layout' )->enum_from_control(),
		'align_items' => V3_Setting::bind_to( 'align_items' )->enum_from_control(),
		'pointer' => V3_Setting::bind_to( 'pointer' )->enum_from_control(),
		'dropdown' => V3_Setting::bind_to( 'dropdown' )->enum_from_control(),
		'full_width' => V3_Setting::bind_to( 'full_width' )->switcher(),
		'text_align' => V3_Setting::bind_to( 'text_align' )->enum_from_control(),
		'toggle' => V3_Setting::bind_to( 'toggle' )->enum_from_control(),
	] )
	->default_target( $main_menu )
	->targets( $pointer, $divider, $dropdown, $dropdown_divider, $toggle );
