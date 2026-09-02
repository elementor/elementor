<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'nav-menu',
	'expected_supported' => [
		'color',
		'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
		'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
	],
	'expected_unsupported' => [ 'transform', 'animation', 'animation-name', 'filter', '-webkit-mask' ],
	'expected_non_style_keys' => [
		'menu_name', 'menu', 'layout', 'align_items', 'pointer',
		'animation_line', 'animation_framed', 'animation_background', 'animation_text',
		'submenu_icon', 'dropdown', 'full_width', 'text_align',
		'toggle', 'toggle_icon_normal', 'toggle_icon_hover_animation', 'toggle_icon_active', 'toggle_align',
		'_element_id',
	],
	'expected_inner_aliases' => [ 'main-menu', 'dropdown', 'toggle' ],
];
