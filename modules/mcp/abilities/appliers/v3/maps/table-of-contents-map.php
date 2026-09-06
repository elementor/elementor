<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * MCP mapping for the `table-of-contents` V3 widget (Elementor Pro).
 *
 * The widget's "Box" Style-tab section styles the wrapper itself, so it stays unscoped:
 * box-level CSS is written outside any alias block.
 *
 * See nav-menu-map.php for the shape and what is derived rather than declared.
 */

return [
	'widget_type' => 'table-of-contents',
	'default_inner_element' => 'list',
	'wrapper' => [
		'style_overrides' => array_merge(
			V3_Widget_Map_Loader::dimension_override( 'padding', 'padding' ),
			V3_Widget_Map_Loader::dimension_override( 'border-radius', 'border_radius' ),
			V3_Widget_Map_Loader::dimension_override( 'border-width', 'border_width' ),
			V3_Widget_Map_Loader::dimension_override( 'min-height', 'min_height' ),
			[
				'background-color' => [
					'setting' => 'background_color',
					'resolver' => 'color',
					'responsive' => false,
				],
				'border-color' => [
					'setting' => 'border_color',
					'resolver' => 'color',
					'responsive' => false,
				],
			]
		),
	],
	'inner_elements' => [
		'header' => [
			'section_id' => 'header_style',
			'label' => 'Header / title bar',
			'style_overrides' => array_merge(
				V3_Widget_Map_Loader::color_overrides_for( [
					'' => 'header_text_color',
				] ),
				[
					'background-color' => [
						'setting' => 'header_background_color',
						'resolver' => 'color',
						'responsive' => false,
					],
				]
			),
		],
		'list' => [
			'section_id' => 'list_style',
			'label' => 'List items',
			'style_overrides' => array_merge(
				V3_Widget_Map_Loader::color_overrides_for( [
					'' => 'item_text_color_normal',
					'hover' => 'item_text_color_hover',
					'active' => 'item_text_color_active',
				] ),
				V3_Widget_Map_Loader::dimension_override( 'max-height', 'max_height' ),
				V3_Widget_Map_Loader::dimension_override( 'padding-left', 'list_indent' )
			),
		],
	],
];
