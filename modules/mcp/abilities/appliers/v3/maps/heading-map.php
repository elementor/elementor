<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'heading',
	'description' => 'V3 heading. Exposed only when the V4 atomic experiment is off; when V4 is on, use `e-heading` instead.',
	'catalog_visibility' => 'v4_disabled',
	'settings' => [
		'title' => [],
		'link' => [],
		'header_size' => [],
	],
	'default_style_target' => 'heading',
	'style_targets' => [
		'heading' => [
			'label' => 'Heading',
			'css_properties' => [
				'color' => [
					'default' => Style_Control_Target::control( 'title_color', 'color' ),
					'hover' => Style_Control_Target::control( 'title_hover_color', 'color' ),
				],
			],
		],
	],
];
