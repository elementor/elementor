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
	'widget_type' => 'nav-menu',
	'description' => 'WordPress menu (Elementor Pro). menu is the menu slug. pointer is the hover effect. Style targets: items (default), pointer (background is the pointer color, border-width its thickness), dropdown, toggle. Address a non-default target with a nested block, e.g. `& pointer { background: #e11d48; }` or `& items:hover { color: #fff; }` (hover text color works with every pointer type).',
	'catalog_visibility' => 'always',
	'settings' => [
		'menu' => Setting_Schemas::string(),
		'layout' => Setting_Schemas::enum( [ 'horizontal', 'vertical', 'dropdown' ], 'horizontal' ),
		'align_items' => Setting_Schemas::enum( [ 'start', 'center', 'end', 'justify' ] ),
		'pointer' => Setting_Schemas::enum( [ 'none', 'underline', 'overline', 'double-line', 'framed', 'background', 'text' ], 'underline' ),
	],
	'default_style_target' => 'items',
	'style_targets' => [
		'items' => Style_Target::make( 'Main menu items' )
			->bind( 'color', V3_Control::bind_to( 'color_menu_item' ) )
			->bind( 'color', V3_Control::bind_to( 'color_menu_item_hover' )->mirror_to( 'color_menu_item_hover_pointer_bg' ), 'hover' )
			->bind( 'font-size', V3_Control::bind_to( 'menu_typography_font_size' )->responsive()->set_dependencies( $when( 'menu_typography_typography', 'custom' ) ) )
			->bind( 'font-weight', V3_Control::bind_to( 'menu_typography_font_weight' )->set_dependencies( $when( 'menu_typography_typography', 'custom' ) ) )
			->bind( 'padding', V3_Control::bind_to( 'padding_horizontal_menu_item' )->responsive()->sides( 'inline-start', 'inline-end' ) )
			->bind( 'padding', V3_Control::bind_to( 'padding_vertical_menu_item' )->responsive()->sides( 'block-start', 'block-end' ) ),
		'pointer' => Style_Target::make( 'Hover pointer' )
			->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_hover' ) )
			->bind( 'border-width', V3_Control::bind_to( 'pointer_width' ) ),
		'dropdown' => Style_Target::make( 'Submenu, and the whole menu on mobile' )
			->bind( 'color', V3_Control::bind_to( 'color_dropdown_item' ) )
			->bind( 'color', V3_Control::bind_to( 'color_dropdown_item_hover' ), 'hover' )
			->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item' ) )
			->bind( 'background', V3_Control::bind_to( 'background_color_dropdown_item_hover' ), 'hover' ),
		'toggle' => Style_Target::make( 'Mobile menu toggle button' )
			->bind( 'color', V3_Control::bind_to( 'toggle_color' ) )
			->bind( 'background', V3_Control::bind_to( 'toggle_background_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'toggle_size' )->responsive() ),
	],
];
