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

$classic_background = Dependency_Manager::make()
	->where( [
		'operator' => 'eq',
		'path' => [ 'background_background' ],
		'value' => 'classic',
	] )
	->get();

return [
	'widget_type' => 'button',
	'description' => 'Clickable button with optional link and icon.',
	'settings' => [
		'text' => Setting_Schemas::string(),
		'link' => Setting_Schemas::link(),
	],
	'default_style_target' => 'button',
	'style_targets' => [
		'button' => Style_Target::make( 'Button' )
			->bind( 'color', V3_Control::bind_to( 'button_text_color' ) )
			->bind( 'color', V3_Control::bind_to( 'hover_color' ), 'hover' )
			->bind( 'background', V3_Control::bind_to( 'background_color' )->set_dependencies( $classic_background ) )
			->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' )->responsive()->set_dependencies( $custom_typography ) )
			->bind( 'font-weight', V3_Control::bind_to( 'typography_font_weight' )->set_dependencies( $custom_typography ) )
			->bind( 'padding', V3_Control::bind_to( 'text_padding' )->responsive() ),
	],
];
