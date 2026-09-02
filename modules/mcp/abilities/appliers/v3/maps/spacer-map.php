<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Spacer's only visible dimension is the `space` slider, which writes `--spacer-size` on the
 * wrapper rather than a standard CSS property. Route the LLM's natural `height` to it so a
 * spacer can be styled without knowing the internal custom property.
 */

return [
	'widget_type' => 'spacer',
	'description' => 'V3 spacer. Prefer container padding or gap over a dedicated spacer when possible.',
	'wrapper' => [
		'style_overrides' => [
			'height' => [
				'setting' => 'space',
				'resolver' => 'slider',
				'responsive' => true,
			],
		],
	],
];
