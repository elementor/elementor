<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$when = static fn( string $setting, string $value ): array => [
	'relation' => 'and',
	'terms' => [
		[
			'operator' => 'eq',
			'path' => [ $setting ],
			'value' => $value,
		],
	],
];

$switcher = static fn( string $description ): array => [
	'type' => 'boolean',
	'description' => $description,
	'convert' => [
		'true' => 'yes',
		'false' => '',
	],
];

return [
	'widget_type' => 'progress',
	'description' => 'Progress bar. percent is { size: 0-100, unit: "%" }. Style targets: bar (default; filled part, color is the inner text), track (unfilled background), title. Address a non-default target with a nested block, e.g. `& track { background: #eee; }`.',
	'catalog_visibility' => 'always',
	'settings' => [
		'title' => Setting_Schemas::string( true ),
		'title_tag' => Setting_Schemas::enum( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p' ], 'span' ),
		'title_display' => $switcher( 'Show the title.' ),
		'percent' => [
			'type' => 'object',
			'properties' => [
				'size' => [ 'type' => 'number' ],
				'unit' => [
					'type' => 'string',
					'enum' => [ '%' ],
				],
			],
		],
		'display_percentage' => [
			'type' => 'boolean',
			'description' => 'Show the percentage inside the bar.',
			'convert' => [
				'true' => 'show',
				'false' => '',
			],
		],
		'inner_text' => Setting_Schemas::string( true ),
	],
	'default_style_target' => 'bar',
	'style_targets' => [
		'bar' => Style_Target::make( 'Filled part of the bar' )
			->bind( 'background', V3_Control::bind_to( 'bar_color' ) )
			->bind( 'height', V3_Control::bind_to( 'bar_height' ) )
			->bind( 'color', V3_Control::bind_to( 'bar_inline_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'bar_inner_typography_font_size' )->responsive()->set_dependencies( $when( 'bar_inner_typography_typography', 'custom' ) ) )
			->bind( 'font-weight', V3_Control::bind_to( 'bar_inner_typography_font_weight' )->set_dependencies( $when( 'bar_inner_typography_typography', 'custom' ) ) ),
		'track' => Style_Target::make( 'Unfilled track behind the bar' )
			->bind( 'background', V3_Control::bind_to( 'bar_bg_color' ) )
			->bind( 'border-radius', V3_Control::bind_to( 'bar_border_radius' ) ),
		'title' => Style_Target::make( 'Title above the bar' )
			->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' )->responsive()->set_dependencies( $when( 'typography_typography', 'custom' ) ) )
			->bind( 'font-weight', V3_Control::bind_to( 'typography_font_weight' )->set_dependencies( $when( 'typography_typography', 'custom' ) ) ),
	],
];
