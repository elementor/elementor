<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * MCP mapping for the `search` V3 widget (Elementor Pro).
 *
 * `results` and `nothing-found-message` only render while the live-results dropdown is open,
 * but their styles are plain settings, so they are safe to expose as aliases.
 *
 * See nav-menu-map.php for the shape and what is derived rather than declared.
 *
 * `class_setting` per inner alias is deferred — same reason as nav-menu-map: the V3 search
 * widget has no per-alias CSS-classes control today.
 */

return [
	'widget_type' => 'search',
	'default_inner_element' => 'search-field',
	'inner_elements' => [
		'search-field' => [
			'section_id' => 'section_search_field_style',
			'label' => 'Search input field',
			'style_overrides' => array_merge(
				V3_Widget_Map_Loader::spacing_overrides_for( 'search_field_padding' ),
				V3_Widget_Map_Loader::color_overrides_for( [
					'' => 'search_field_input_text_color_normal',
					'focus' => 'search_field_input_text_color_focus',
				] )
			),
		],
		'submit' => [
			'section_id' => 'style_section_submit',
			'label' => 'Submit button',
			'style_overrides' => array_merge(
				V3_Widget_Map_Loader::spacing_overrides_for( 'submit_padding' ),
				V3_Widget_Map_Loader::border_radius_overrides_for( 'submit_border_radius' ),
				V3_Widget_Map_Loader::color_overrides_for( [
					'' => 'submit_text_color_normal',
					'hover' => 'submit_text_color_hover',
				] )
			),
		],
		'results' => [
			'section_id' => 'style_section_results',
			'label' => 'Live results dropdown',
			'style_overrides' => array_merge(
				V3_Widget_Map_Loader::spacing_overrides_for( 'results_padding' ),
				V3_Widget_Map_Loader::border_radius_overrides_for( 'results_border_radius' )
			),
		],
		'nothing-found-message' => [
			'section_id' => 'style_section_nothing_found_message',
			'label' => 'Nothing-found message',
			'style_overrides' => array_merge(
				V3_Widget_Map_Loader::color_overrides_for( [
					'' => 'nothing_found_message_color',
				] ),
				V3_Widget_Map_Loader::dimension_override( 'padding-top', 'nothing_found_message_space_from_top' ),
				V3_Widget_Map_Loader::dimension_override( 'padding-bottom', 'nothing_found_message_space_from_bottom' )
			),
		],
	],
];
