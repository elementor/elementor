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
	'widget_type' => 'social-icons',
	'description' => 'Row of linked social icons. social_icon_list replaces the whole list; each item is { social_icon: { value: "fab fa-facebook", library: "fa-brands" }, link: { url } }. Style targets: icons (default; background is the button color, color the glyph, font-size the icon size), row (gap between icons). Address a non-default target with a nested block, e.g. `& row { column-gap: 12px; }`.',
	'catalog_visibility' => 'always',
	'settings' => [
		'social_icon_list' => [
			'type' => 'array',
			'items' => [ 'type' => 'object' ],
		],
		'shape' => Setting_Schemas::enum( [ 'square', 'rounded', 'circle' ], 'rounded' ),
		'columns' => Setting_Schemas::enum( [ '0', '1', '2', '3', '4', '5', '6' ] ),
		'icon_color' => Setting_Schemas::enum( [ 'default', 'custom' ], 'default' ),
	],
	'default_style_target' => 'icons',
	'style_targets' => [
		'icons' => Style_Target::make( 'Each icon button' )
			->bind( 'background', V3_Control::bind_to( 'icon_primary_color' )->set_dependencies( $when( 'icon_color', 'custom' ) ) )
			->bind( 'background', V3_Control::bind_to( 'hover_primary_color' ), 'hover' )
			->bind( 'color', V3_Control::bind_to( 'icon_secondary_color' )->set_dependencies( $when( 'icon_color', 'custom' ) ) )
			->bind( 'color', V3_Control::bind_to( 'hover_secondary_color' ), 'hover' )
			->bind( 'border-color', V3_Control::bind_to( 'image_border_color' ) )
			->bind( 'border-color', V3_Control::bind_to( 'hover_border_color' ), 'hover' )
			->bind( 'border-width', V3_Control::bind_to( 'image_border_width' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( 'border_radius' )->responsive() )
			->bind( 'font-size', V3_Control::bind_to( 'icon_size' )->responsive() ),
		'row' => Style_Target::make( 'Row of icons' )
			->bind( 'column-gap', V3_Control::bind_to( 'icon_spacing' )->responsive() ),
	],
];
