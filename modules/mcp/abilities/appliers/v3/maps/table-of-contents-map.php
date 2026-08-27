<?php

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
	'inner_elements' => [
		'header' => [
			'section_id' => 'header_style',
			'label' => 'Header / title bar',
		],
		'list' => [
			'section_id' => 'list_style',
			'label' => 'List items',
		],
	],
];
