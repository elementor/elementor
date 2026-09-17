<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'button',
	'description' => 'Clickable button with optional link and icon.',
	'catalog_visibility' => 'v4_disabled',
	'settings' => [
		'text' => [
			'type' => 'string',
		],
		'link' => [
			'type' => 'object',
			'properties' => [
				'url' => [ 'type' => 'string' ],
				'is_external' => [
					'type' => 'boolean',
					'convert' => [
						'true' => 'on',
						'false' => '',
					],
				],
				'nofollow' => [
					'type' => 'boolean',
					'convert' => [
						'true' => 'on',
						'false' => '',
					],
				],
			],
		],
	],
	'default_style_target' => 'button',
	'style_targets' => [
		'button' => [
			'label' => 'Button',
			'css_properties' => [
				'color' => [
					'default' => Style_Control_Target::control( 'button_text_color', 'color' ),
					'hover' => Style_Control_Target::control( 'hover_color', 'color' ),
				],
			],
		],
	],
];
