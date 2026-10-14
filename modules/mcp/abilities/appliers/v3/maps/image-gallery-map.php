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
	'widget_type' => 'image-gallery',
	'description' => 'WordPress image grid. wp_gallery is a list of { id, url } media items. Style targets: images (default; border-width/border-color imply a solid border unless border-style is given), grid (gap between images, one value for all breakpoints), caption. Address a non-default target with a nested block, e.g. `& caption { color: #555; }` or `& grid { gap: 24px; }`. gallery_columns applies to every breakpoint; this widget has no per-device column count.',
	'catalog_visibility' => 'always',
	'settings' => [
		'wp_gallery' => [
			'type' => 'array',
			'items' => [ 'type' => 'object' ],
		],
		'thumbnail_size' => Setting_Schemas::enum( [ 'thumbnail', 'medium', 'medium_large', 'large', 'full' ], 'thumbnail' ),
		'gallery_columns' => Setting_Schemas::enum( [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ], '4' ),
		'gallery_display_caption' => Setting_Schemas::enum( [ 'none', '' ] ),
		'gallery_link' => Setting_Schemas::enum( [ 'file', 'attachment', 'none' ], 'file' ),
	],
	'default_style_target' => 'images',
	'style_targets' => [
		'images' => Style_Target::make( 'Gallery images' )
			->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() )
			->bind( 'border-style', V3_Control::bind_to( 'image_border_border' ) )
			->bind( 'border-width', V3_Control::bind_to( 'image_border_width' )->responsive()->set_dependencies( $when( 'image_border_border', 'solid' ) ) )
			->bind( 'border-color', V3_Control::bind_to( 'image_border_color' )->set_dependencies( $when( 'image_border_border', 'solid' ) ) ),
		'grid' => Style_Target::make( 'Spacing between images' )
			->bind( 'gap', V3_Control::bind_to( 'image_spacing_custom' )->set_dependencies( $when( 'image_spacing', 'custom' ) ) ),
		'caption' => Style_Target::make( 'Image captions' )
			->bind( 'color', V3_Control::bind_to( 'text_color' ) )
			->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive() )
			->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' )->responsive()->set_dependencies( $when( 'typography_typography', 'custom' ) ) )
			->bind( 'font-weight', V3_Control::bind_to( 'typography_font_weight' )->set_dependencies( $when( 'typography_typography', 'custom' ) ) ),
	],
];
