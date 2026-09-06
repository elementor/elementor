<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * V3 accordion. Content lives in the `tabs` repeater (see get-widget-schema for the item shape);
 * styling is scoped per sub-part via inner-element aliases so an LLM can target the item shell,
 * the title, the toggle icon, and the collapsed content independently.
 */

return [
	'widget_type' => 'accordion',
	'description' => 'V3 accordion (collapsible sections, one open at a time by default). Content-tab `tabs` repeater carries the items (`tab_title` + `tab_content` per item).',
	'default_inner_element' => 'item',
	'inner_elements' => [
		'item' => [
			'section_id' => 'section_title_style',
			'label' => 'Accordion item shell (border, background)',
		],
		'title' => [
			'section_id' => 'section_toggle_style_title',
			'label' => 'Accordion item title text',
		],
		'icon' => [
			'section_id' => 'section_toggle_style_icon',
			'label' => 'Accordion toggle icon',
		],
		'content' => [
			'section_id' => 'section_toggle_style_content',
			'label' => 'Accordion open-panel content',
		],
	],
];
