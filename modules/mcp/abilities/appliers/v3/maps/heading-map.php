<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'heading',
	'description' => 'Text heading with optional link and HTML tag (h1–h6, div, span, or p).',
	'catalog_visibility' => 'v4_disabled',
	'settings' => [
		'title' => Setting_Schemas::string( true ),
		'link'  => Setting_Schemas::link(),
		'tag'   => Setting_Schemas::enum(
			[ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p' ],
			'h2',
			'header_size'
		),
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
