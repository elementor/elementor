<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'text-editor',
	'description' => 'Rich-text block with inline formatting.',
	'catalog_visibility' => 'v4_disabled',
	'settings' => [
		'editor' => [
			'type' => 'string',
		],
	],
	'default_style_target' => 'text-editor',
	'style_targets' => [
		'text-editor' => [
			'label' => 'Text Editor',
			'css_properties' => [
				'color' => [
					'default' => Style_Control_Target::control( 'text_color', 'color' ),
				],
			],
		],
	],
];
