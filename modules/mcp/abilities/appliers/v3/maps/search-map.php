<?php

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
 */

return [
	'widget_type' => 'search',
	'default_inner_element' => 'search-field',
	'inner_elements' => [
		'search-field' => [
			'section_id' => 'section_search_field_style',
			'label' => 'Search input field',
		],
		'submit' => [
			'section_id' => 'style_section_submit',
			'label' => 'Submit button',
		],
		'results' => [
			'section_id' => 'style_section_results',
			'label' => 'Live results dropdown',
		],
		'nothing-found-message' => [
			'section_id' => 'style_section_nothing_found_message',
			'label' => 'Nothing-found message',
		],
	],
];
