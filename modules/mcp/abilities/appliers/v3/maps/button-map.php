<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'button',
	'description' => 'Clickable button with optional link and icon.',
	'catalog_visibility' => 'v4_disabled',
	'settings' => [
		'text' => Setting_Schemas::string(),
		'link' => Setting_Schemas::link(),
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
				'background-color' => [
					'default' => Style_Control_Target::control( 'background_color', 'color' ),
				],
				'font-size' => [
					'default' => Style_Control_Target::typography( 'typography', 'font_size', 'slider', true ),
				],
				'font-weight' => [
					'default' => Style_Control_Target::typography( 'typography', 'font_weight', 'text' ),
				],
				'padding' => [
					'default' => Style_Control_Target::control( 'text_padding', 'sides', true ),
				],
			],
		],
	],
];
