<?php

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$classic_background = Dependency_Manager::make()
	->where( [
		'operator' => 'eq',
		'path' => [ 'background_background' ],
		'value' => 'classic',
	] )
	->get();

$box_shadow = Dependency_Manager::make()
	->where( [
		'operator' => 'eq',
		'path' => [ 'box_shadow_box_shadow_type' ],
		'value' => 'yes',
	] )
	->get();

return [
	'widget_type' => 'container',
	'description' => 'Flex/Grid layout container for nesting child elements. Styles: background, padding, margin, border-radius, one outer px box-shadow, and flex alignment (justify-content, align-items: flex-start, center, flex-end, ...).',
	'catalog_visibility' => 'always',
	'settings' => [
		'content_width' => Setting_Schemas::enum( [ 'boxed', 'full' ], 'boxed' ),
	],
	'default_style_target' => 'container',
	'style_targets' => [
		'container' => Style_Target::make( 'Container' )
			->bind( 'background', V3_Control::bind_to( 'background_color' )->set_dependencies( $classic_background ) )
			->bind( 'padding', V3_Control::bind_to( 'padding' )->responsive() )
			->bind( 'margin', V3_Control::bind_to( 'margin' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( 'border_radius' )->responsive() )
			->bind( 'box-shadow', V3_Control::bind_to( 'box_shadow_box_shadow' )->set_dependencies( $box_shadow ) )
			->bind( 'justify-content', V3_Control::bind_to( 'flex_justify_content' )->responsive() )
			->bind( 'align-items', V3_Control::bind_to( 'flex_align_items' )->responsive() ),
	],
];
