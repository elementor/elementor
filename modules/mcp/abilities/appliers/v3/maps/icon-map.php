<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Icon's Style-tab writes to the `.elementor-icon` inner element via wrapper-scoped
 * selectors, not to the wrapper directly. Route the LLM's natural wrapper properties
 * (`color`, `font-size`) to the underlying icon settings so it doesn't need to know the
 * inner selector.
 */

return [
	'widget_type' => 'icon',
	'description' => 'V3 icon. Exposed only when the V4 atomic experiment is off; when V4 is on, use `e-svg` or `e-icon` instead.',
	'wrapper' => [
		'style_overrides' => [
			'color' => [
				'setting' => 'primary_color',
				'resolver' => 'color',
				'responsive' => false,
			],
			'font-size' => [
				'setting' => 'size',
				'resolver' => 'slider',
				'responsive' => true,
			],
		],
	],
];
