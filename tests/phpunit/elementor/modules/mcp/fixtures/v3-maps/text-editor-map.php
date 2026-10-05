<?php

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$custom_typography = Dependency_Manager::make()
	->where( [
		'operator' => 'eq',
		'path' => [ 'typography_typography' ],
		'value' => 'custom',
	] )
	->get();

return [
	'widget_type' => 'text-editor',
	'description' => 'Rich-text block with inline formatting.',
	'settings' => [
		'editor' => Setting_Schemas::string(),
	],
	'default_style_target' => 'text-editor',
	'style_targets' => [
		'text-editor' => Style_Target::make( 'Text Editor' )
			->bind( 'color', V3_Control::bind_to( 'text_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' )->responsive()->set_dependencies( $custom_typography ) )
			->bind( 'line-height', V3_Control::bind_to( 'typography_line_height' )->responsive()->set_dependencies( $custom_typography ) ),
	],
];
