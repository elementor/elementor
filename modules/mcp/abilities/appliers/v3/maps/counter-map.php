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
	'widget_type' => 'counter',
	'description' => 'Animated number that counts from starting_number to ending_number, with optional prefix, suffix and title. Style targets: number (default), title. text-align takes logical start, center or end (start is the right side in RTL). Address a non-default target with a nested block, e.g. `& title { color: #333; text-align: center; }`. The widget has no hover styles.',
	'catalog_visibility' => 'always',
	'settings' => [
		'starting_number' => [ 'type' => 'number' ],
		'ending_number' => [ 'type' => 'number' ],
		'prefix' => Setting_Schemas::string( true ),
		'suffix' => Setting_Schemas::string( true ),
		'duration' => [
			'type' => 'number',
			'description' => 'Animation duration in milliseconds.',
		],
		'thousand_separator' => $switcher( 'Show a thousand separator.' ),
		'thousand_separator_char' => Setting_Schemas::enum( [ '', '.', ' ', '_', "'" ] ),
		'title' => Setting_Schemas::string( true ),
		'title_tag' => Setting_Schemas::enum( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p' ], 'div' ),
		'title_position' => [
			'type' => 'string',
			'enum' => [ 'before', 'after', 'start', 'end' ],
			'description' => 'Where the title sits relative to the number: before (above), after (below), start or end (beside it, logical so it follows RTL).',
		],
	],
	'default_style_target' => 'number',
	'style_targets' => [
		'number' => Style_Target::make( 'Number, including prefix and suffix' )
			->bind( 'color', V3_Control::bind_to( 'number_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'typography_number_font_size' )->responsive()->set_dependencies( $when( 'typography_number_typography', 'custom' ) ) )
			->bind( 'font-weight', V3_Control::bind_to( 'typography_number_font_weight' )->set_dependencies( $when( 'typography_number_typography', 'custom' ) ) )
			->bind( 'text-align', V3_Control::bind_to( 'number_position' )->responsive() ),
		'title' => Style_Target::make( 'Title' )
			->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'typography_title_font_size' )->responsive()->set_dependencies( $when( 'typography_title_typography', 'custom' ) ) )
			->bind( 'font-weight', V3_Control::bind_to( 'typography_title_font_weight' )->set_dependencies( $when( 'typography_title_typography', 'custom' ) ) )
			->bind( 'text-align', V3_Control::bind_to( 'title_horizontal_alignment' )->responsive() ),
	],
];
