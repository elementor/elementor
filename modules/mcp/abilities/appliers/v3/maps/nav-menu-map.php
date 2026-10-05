<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Advanced_Style_Fragments;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Bindings;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$main_menu = Style_Target::make( 'Main menu items' );
Style_Bindings::typography( $main_menu, 'menu_typography' );
$main_menu
	->bind( 'color', V3_Control::bind_to( 'color_menu_item' ) )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_hover' ), 'hover' )
	->bind( 'color', V3_Control::bind_to( 'color_menu_item_active' ), 'selected' )
	->bind( 'padding', V3_Control::bind_to( 'padding_horizontal_menu_item' )->responsive()->sides( 'inline-start', 'inline-end' ) )
	->bind( 'padding', V3_Control::bind_to( 'padding_vertical_menu_item' )->responsive()->sides( 'block-start', 'block-end' ) )
	->bind( 'gap', V3_Control::bind_to( 'menu_space_between' )->responsive() );

$dropdown = Style_Target::make( 'Submenu on desktop, and the whole menu on mobile' );
Style_Bindings::typography( $dropdown, 'dropdown_typography', [ 'line-height' ] );
Style_Bindings::border( $dropdown, 'dropdown_border' );
Style_Bindings::box_shadow( $dropdown, 'dropdown_box_shadow' );
$dropdown
	->bind( 'color', V3_Control::bind_to( 'color_dropdown_item' ) )
	->bind( 'color', V3_Control::bind_to( 'color_dropdown_item_hover' ), 'hover' )
	->bind( 'color', V3_Control::bind_to( 'color_dropdown_item_active' ), 'selected' )
	->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item' ) )
	->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item_hover' ), 'hover' )
	->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item_active' ), 'selected' )
	->bind( 'border-radius', V3_Control::bind_to( 'dropdown_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'padding_horizontal_dropdown_item' )->responsive()->sides( 'inline-start', 'inline-end' ) )
	->bind( 'padding', V3_Control::bind_to( 'padding_vertical_dropdown_item' )->responsive()->sides( 'block-start', 'block-end' ) )
	->bind( 'margin', V3_Control::bind_to( 'dropdown_top_distance' )->responsive()->sides( 'block-start' ) );

return [
	'widget_type' => 'nav-menu',
	'description' => 'WordPress menu rendered as a horizontal, vertical or dropdown navigation, with a mobile toggle button.',
	'settings' => [
		'menu_name' => Setting_Schemas::string(),
		'menu' => Setting_Schemas::string(),
		'layout' => Setting_Schemas::enum_from_control(),
		'align_items' => Setting_Schemas::enum_from_control(),
		'pointer' => Setting_Schemas::enum_from_control(),
		'animation_line' => Setting_Schemas::enum_from_control(),
		'animation_framed' => Setting_Schemas::enum_from_control(),
		'animation_background' => Setting_Schemas::enum_from_control(),
		'animation_text' => Setting_Schemas::enum_from_control(),
		'submenu_icon' => Setting_Schemas::icons(),
		'dropdown' => Setting_Schemas::enum_from_control(),
		'full_width' => Setting_Schemas::switcher(),
		'text_align' => Setting_Schemas::enum_from_control(),
		'toggle' => Setting_Schemas::enum_from_control(),
		'toggle_icon_normal' => Setting_Schemas::icons(),
		'toggle_icon_hover_animation' => Setting_Schemas::string(),
		'toggle_icon_active' => Setting_Schemas::icons(),
		'toggle_align' => Setting_Schemas::enum_from_control(),
		'nav_menu_divider' => Setting_Schemas::switcher(),
	],
	'default_style_target' => 'main-menu',
	'style_targets' => [
		'main-menu' => $main_menu,
		'pointer' => Style_Target::make( 'Main menu hover pointer (underline, overline, frame or background); color is the item text over a background pointer' )
			->bind( 'color', V3_Control::bind_to( 'color_menu_item_hover_pointer_bg' ), 'hover' )
			->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_hover' ), 'hover' )
			->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_active' ), 'selected' )
			->bind( 'border-width', V3_Control::bind_to( 'pointer_width' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( 'border_radius_menu_item' )->responsive() ),
		'divider' => Style_Target::make( 'Divider between horizontal main menu items' )
			->bind( 'border-style', V3_Control::bind_to( 'nav_menu_divider_style' ) )
			->bind( 'border-width', V3_Control::bind_to( 'nav_menu_divider_weight' ) )
			->bind( 'height', V3_Control::bind_to( 'nav_menu_divider_height' ) )
			->bind( 'border-color', V3_Control::bind_to( 'nav_menu_divider_color' ) ),
		'dropdown' => $dropdown,
		'dropdown-divider' => Style_Target::make( 'Divider between dropdown items' )
			->bind( 'border-style', V3_Control::bind_to( 'dropdown_divider_border' ) )
			->bind( 'border-color', V3_Control::bind_to( 'dropdown_divider_color' ) )
			->bind( 'border-width', V3_Control::bind_to( 'dropdown_divider_width' ) ),
		'toggle' => Style_Target::make( 'Mobile menu toggle button' )
			->bind( 'color', V3_Control::bind_to( 'toggle_color' ) )
			->bind( 'color', V3_Control::bind_to( 'toggle_color_hover' ), 'hover' )
			->bind( 'background', V3_Control::bind_to( 'toggle_background_color' ) )
			->bind( 'background', V3_Control::bind_to( 'toggle_background_color_hover' ), 'hover' )
			->bind( 'font-size', V3_Control::bind_to( 'toggle_size' )->responsive() )
			->bind( 'border-width', V3_Control::bind_to( 'toggle_border_width' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( 'toggle_border_radius' )->responsive() ),
		'wrapper' => Advanced_Style_Fragments::wrapper(),
	],
];
