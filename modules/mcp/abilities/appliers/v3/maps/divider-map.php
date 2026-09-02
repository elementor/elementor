<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Divider does not expose CSS `border-*` shorthands directly — its Style-tab controls are
 * `weight` (slider → `--divider-border-width`), `style` (select → `--divider-border-style`)
 * and `color` (color → `--divider-color`). Map the LLM's natural `border-*` names onto them
 * so a divider can be styled with the same vocabulary as any other bordered element.
 */

return [
	'widget_type' => 'divider',
	'description' => 'V3 divider. Exposed only when the V4 atomic experiment is off; when V4 is on, use `e-divider` instead.',
	'wrapper' => [
		'style_overrides' => [
			'border-width' => [
				'setting' => 'weight',
				'resolver' => 'slider',
				'responsive' => false,
			],
			'border-top-width' => [
				'setting' => 'weight',
				'resolver' => 'slider',
				'responsive' => false,
			],
			'border-style' => [
				'setting' => 'style',
				'resolver' => 'text',
				'responsive' => false,
			],
			'border-color' => [
				'setting' => 'color',
				'resolver' => 'color',
				'responsive' => false,
			],
		],
	],
];
