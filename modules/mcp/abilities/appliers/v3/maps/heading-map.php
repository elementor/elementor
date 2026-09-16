<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'heading',
	'description' => 'Text heading with optional link and HTML tag (h1–h6, div, span, or p).',
	'catalog_visibility' => 'v4_disabled',
	'settings' => [
		'title' => [
			'type' => 'string',
			'dynamic' => true,
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
		'tag' => [
			'type' => 'string',
			'enum' => [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p' ],
			'default' => 'h2',
			'key' => 'header_size',
		],
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
