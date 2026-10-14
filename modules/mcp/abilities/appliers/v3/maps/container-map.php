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

return [
	'widget_type' => 'container',
	'description' => 'Flex/Grid layout container for nesting child elements.',
	'catalog_visibility' => 'always',
	'settings' => [
		'content_width' => Setting_Schemas::enum( [ 'boxed', 'full' ], 'boxed' ),
	],
	'default_style_target' => 'container',
	'style_targets' => [
		'container' => Style_Target::make( 'Container' )
			->bind( 'background', V3_Control::bind_to( 'background_color' )->set_dependencies( $classic_background ) )
			->bind( 'padding', V3_Control::bind_to( 'padding' )->responsive() )
			->bind( 'margin', V3_Control::bind_to( 'margin' )->responsive() ),
	],
];
