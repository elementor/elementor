<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * MCP mapping for the `nav-menu` V3 widget (Elementor Pro).
 *
 * Declaring an inner element opts its Style-tab section into scoped CSS: the LLM styles it
 * with `<alias> { ... }` blocks. Everything else — which controls belong to the alias, its
 * canonical selector, the wrapper property map and `non_style_keys` — is derived from the
 * widget's own controls by V3_Control_Introspector.
 *
 * Intended migration target: a `get_mcp_map()` method on the widget class itself.
 */

return [
	'widget_type' => 'nav-menu',
	'default_inner_element' => 'main-menu',
	'inner_elements' => [
		'main-menu' => [
			'section_id' => 'section_style_main-menu',
			'label' => 'Main menu items',
		],
		'dropdown' => [
			'section_id' => 'section_style_dropdown',
			'label' => 'Dropdown / sub-menu',
		],
		'toggle' => [
			'section_id' => 'style_toggle',
			'label' => 'Mobile toggle button',
			'style_overrides' => [
				// The toggle icon is sized through a wrapper custom property, which is never
				// exposed as a CSS property, so `font-size` is routed to it explicitly.
				'font-size' => [
					'setting' => 'toggle_size',
					'resolver' => 'dimension',
					'responsive' => true,
				],
			],
		],
	],
];
