<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'container',
	'description' => 'Flex/Grid layout container for nesting child elements.',
	'catalog_visibility' => 'always',
	'settings' => [
		'content_width' => Setting_Schemas::enum( [ 'boxed', 'full' ], 'boxed' ),
	],
	'default_style_target' => 'container',
	'style_targets' => [
		'container' => [
			'label' => 'Container',
			'css_properties' => [
				'background-color' => [
					'default' => Style_Control_Target::control( 'background_color', 'color' ),
				],
				'padding' => [
					'default' => Style_Control_Target::control( 'padding', 'sides', true ),
				],
				'margin' => [
					'default' => Style_Control_Target::control( 'margin', 'sides', true ),
				],
			],
		],
	],
];
