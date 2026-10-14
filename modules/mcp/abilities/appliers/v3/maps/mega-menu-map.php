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
	'widget_type' => 'mega-menu',
	'description' => 'Mega menu (Elementor Pro): menu items with dropdown panels. Panels only render for items that have nested dropdown content, which this map cannot create, so panel styles apply only to items that already have content. Style targets: titles (default; menu item titles), panel (open dropdown panel). Address a non-default target with a nested block, e.g. `& panel { background: #fff; padding: 24px; }` or `&:hover { color: #fff; }`.',
	'catalog_visibility' => 'always',
	'settings' => [],
	'default_style_target' => 'titles',
	'style_targets' => [
		'titles' => Style_Target::make( 'Menu item titles' )
			->bind( 'color', V3_Control::bind_to( 'menu_item_title_text_color_normal' ) )
			->bind( 'color', V3_Control::bind_to( 'menu_item_title_text_color_hover' ), 'hover' )
			->bind( 'background', V3_Control::bind_to( 'menu_item_title_background_color_color' )->set_dependencies( $when( 'menu_item_title_background_color_background', 'classic' ) ) )
			->bind( 'background', V3_Control::bind_to( 'menu_item_title_background_color_hover_color' )->set_dependencies( $when( 'menu_item_title_background_color_hover_background', 'classic' ) ), 'hover' )
			->bind( 'font-size', V3_Control::bind_to( 'menu_item_title_typography_font_size' )->responsive()->set_dependencies( $when( 'menu_item_title_typography_typography', 'custom' ) ) )
			->bind( 'font-weight', V3_Control::bind_to( 'menu_item_title_typography_font_weight' )->set_dependencies( $when( 'menu_item_title_typography_typography', 'custom' ) ) )
			->bind( 'padding', V3_Control::bind_to( 'menu_item_title_padding' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( 'menu_item_title_border_radius' )->responsive() ),
		'panel' => Style_Target::make( 'Open dropdown panel' )
			->bind( 'background', V3_Control::bind_to( 'content_background_color_color' )->set_dependencies( $when( 'content_background_color_background', 'classic' ) ) )
			->bind( 'padding', V3_Control::bind_to( 'content_padding' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( 'content_border_radius' )->responsive() ),
	],
];
