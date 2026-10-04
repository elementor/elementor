<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Advanced_Style_Fragments;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
		'main-menu' => [
			'label' => 'Main menu items',
			'css_properties' => Style_Control_Target::typography_group( 'menu_typography' ) + [
				'color' => [
					'default' => Style_Control_Target::control( 'color_menu_item', 'color' ),
					'hover' => Style_Control_Target::control( 'color_menu_item_hover', 'color' ),
					'selected' => Style_Control_Target::control( 'color_menu_item_active', 'color' ),
				],
				'padding-inline' => [
					'default' => Style_Control_Target::control( 'padding_horizontal_menu_item', 'slider', true ),
				],
				'padding-block' => [
					'default' => Style_Control_Target::control( 'padding_vertical_menu_item', 'slider', true ),
				],
				'gap' => [
					'default' => Style_Control_Target::control( 'menu_space_between', 'slider', true ),
				],
			],
		],
		'pointer' => [
			'label' => 'Main menu hover pointer (underline, overline, frame or background); color is the item text over a background pointer',
			'css_properties' => [
				'color' => [
					'hover' => Style_Control_Target::control( 'color_menu_item_hover_pointer_bg', 'color' ),
				],
				'background-color' => [
					'hover' => Style_Control_Target::control( 'pointer_color_menu_item_hover', 'color' ),
					'selected' => Style_Control_Target::control( 'pointer_color_menu_item_active', 'color' ),
				],
				'border-width' => [
					'default' => Style_Control_Target::control( 'pointer_width', 'slider', true ),
				],
				'border-radius' => [
					'default' => Style_Control_Target::control( 'border_radius_menu_item', 'slider', true ),
				],
			],
		],
		'divider' => [
			'label' => 'Divider between horizontal main menu items',
			'css_properties' => [
				'border-style' => [
					'default' => Style_Control_Target::choice( 'nav_menu_divider_style' ),
				],
				'border-width' => [
					'default' => Style_Control_Target::control( 'nav_menu_divider_weight', 'slider' ),
				],
				'height' => [
					'default' => Style_Control_Target::control( 'nav_menu_divider_height', 'slider' ),
				],
				'border-color' => [
					'default' => Style_Control_Target::control( 'nav_menu_divider_color', 'color' ),
				],
			],
		],
		'dropdown' => [
			'label' => 'Submenu on desktop, and the whole menu on mobile',
			'css_properties' => Style_Control_Target::typography_group( 'dropdown_typography', 'default', [ 'line-height' ] )
				+ Style_Control_Target::border_group( 'dropdown_border' )
				+ [
					'color' => [
						'default' => Style_Control_Target::control( 'color_dropdown_item', 'color' ),
						'hover' => Style_Control_Target::control( 'color_dropdown_item_hover', 'color' ),
						'selected' => Style_Control_Target::control( 'color_dropdown_item_active', 'color' ),
					],
					'background-color' => [
						'default' => Style_Control_Target::control( 'background_color_dropdown_item', 'color' ),
						'hover' => Style_Control_Target::control( 'background_color_dropdown_item_hover', 'color' ),
						'selected' => Style_Control_Target::control( 'background_color_dropdown_item_active', 'color' ),
					],
					'border-radius' => [
						'default' => Style_Control_Target::control( 'dropdown_border_radius', 'sides', true ),
					],
					'box-shadow' => [
						'default' => Style_Control_Target::box_shadow( 'dropdown_box_shadow' ),
					],
					'padding-inline' => [
						'default' => Style_Control_Target::control( 'padding_horizontal_dropdown_item', 'slider', true ),
					],
					'padding-block' => [
						'default' => Style_Control_Target::control( 'padding_vertical_dropdown_item', 'slider', true ),
					],
					'margin-top' => [
						'default' => Style_Control_Target::control( 'dropdown_top_distance', 'slider', true ),
					],
				],
		],
		'dropdown-divider' => [
			'label' => 'Divider between dropdown items',
			'css_properties' => [
				'border-style' => [
					'default' => Style_Control_Target::choice( 'dropdown_divider_border' ),
				],
				'border-color' => [
					'default' => Style_Control_Target::control( 'dropdown_divider_color', 'color' ),
				],
				'border-width' => [
					'default' => Style_Control_Target::control( 'dropdown_divider_width', 'slider' ),
				],
			],
		],
		'toggle' => [
			'label' => 'Mobile menu toggle button',
			'css_properties' => [
				'color' => [
					'default' => Style_Control_Target::control( 'toggle_color', 'color' ),
					'hover' => Style_Control_Target::control( 'toggle_color_hover', 'color' ),
				],
				'background-color' => [
					'default' => Style_Control_Target::control( 'toggle_background_color', 'color' ),
					'hover' => Style_Control_Target::control( 'toggle_background_color_hover', 'color' ),
				],
				'font-size' => [
					'default' => Style_Control_Target::control( 'toggle_size', 'slider', true ),
				],
				'border-width' => [
					'default' => Style_Control_Target::control( 'toggle_border_width', 'slider', true ),
				],
				'border-radius' => [
					'default' => Style_Control_Target::control( 'toggle_border_radius', 'slider', true ),
				],
			],
		],
		'wrapper' => [
			'label' => 'Widget wrapper (Advanced tab: spacing, size, position, background, border)',
			'css_properties' => Advanced_Style_Fragments::wrapper(),
		],
	],
];
