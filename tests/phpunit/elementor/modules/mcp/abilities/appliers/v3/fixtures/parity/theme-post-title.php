<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Parity fixture for the V3 `theme-post-title` widget.
 *
 * Concretely: the LLM should be able to write the same core visual language on this widget
 * as on any headline — color, typography, spacing, alignment, size — but transforms,
 * animations and other non-native properties must stay in custom_css.
 */

return [
	'widget_type' => 'theme-post-title',

	'expected_supported' => [
		'color',
		'text-align',
		'padding',
		'padding-top',
		'padding-right',
		'padding-bottom',
		'padding-left',
		'margin',
		'margin-top',
		'margin-right',
		'margin-bottom',
		'margin-left',
		'font-family',
		'font-size',
		'font-weight',
		'line-height',
		'letter-spacing',
	],

	'expected_unsupported' => [
		'transform',
		'animation',
		'animation-name',
		'-webkit-mask',
	],

	'expected_non_style_keys' => [ 'title', 'link', 'size', 'header_size', '_element_id' ],

	'expected_inner_aliases' => [],
];
