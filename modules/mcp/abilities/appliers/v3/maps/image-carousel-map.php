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
	'widget_type' => 'image-carousel',
	'description' => 'Sliding image carousel. carousel is a list of { id, url } media items. Style targets: images (default), arrows, dots (background is the active dot color), caption. Address a non-default target with a nested block, e.g. `& dots { background: #111; }`.',
	'catalog_visibility' => 'always',
	'settings' => [
		'carousel' => [
			'type' => 'array',
			'items' => [ 'type' => 'object' ],
		],
		'slides_to_show' => Setting_Schemas::enum( [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ] ),
		'navigation' => Setting_Schemas::enum( [ 'both', 'arrows', 'dots', 'none' ], 'both' ),
		'image_stretch' => Setting_Schemas::enum( [ 'no', 'yes' ], 'no' ),
		'caption_type' => Setting_Schemas::enum( [ '', 'title', 'caption', 'description' ] ),
		'autoplay' => $switcher( 'Advance slides automatically.' ),
		'infinite' => $switcher( 'Loop back to the first slide.' ),
		'link' => Setting_Schemas::link(),
	],
	'default_style_target' => 'images',
	'style_targets' => [
		'images' => Style_Target::make( 'Slide images' )
			->bind( 'border-radius', V3_Control::bind_to( 'image_border_radius' )->responsive() )
			->bind( 'border-width', V3_Control::bind_to( 'image_border_width' )->responsive() )
			->bind( 'border-color', V3_Control::bind_to( 'image_border_color' ) ),
		'arrows' => Style_Target::make( 'Previous and next arrows' )
			->bind( 'color', V3_Control::bind_to( 'arrows_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'arrows_size' )->responsive() ),
		'dots' => Style_Target::make( 'Pagination dots' )
			->bind( 'background', V3_Control::bind_to( 'dots_color' ) )
			->bind( 'width', V3_Control::bind_to( 'dots_size' )->responsive() ),
		'caption' => Style_Target::make( 'Slide captions' )
			->bind( 'color', V3_Control::bind_to( 'caption_text_color' ) )
			->bind( 'text-align', V3_Control::bind_to( 'caption_align' )->responsive() )
			->bind( 'font-size', V3_Control::bind_to( 'caption_typography_font_size' )->responsive()->set_dependencies( $when( 'caption_typography_typography', 'custom' ) ) ),
	],
];
