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
	'widget_type' => 'heading',
	'description' => 'Text heading with optional link and HTML tag (h1–h6, div, span, or p).',
	'settings' => [
		'title' => Setting_Schemas::string( true ),
		'link'  => Setting_Schemas::link(),
		'tag'   => Setting_Schemas::enum(
			[ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p' ],
			'h2',
			'header_size'
		),
	],
	'default_style_target' => 'heading',
	'style_targets' => [
		'heading' => Style_Target::make( 'Heading' )
			->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			->bind( 'color', V3_Control::bind_to( 'title_hover_color' ), 'hover' )
			->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' )->responsive()->set_dependencies( $custom_typography ) )
			->bind( 'line-height', V3_Control::bind_to( 'typography_line_height' )->responsive()->set_dependencies( $custom_typography ) )
			->bind( 'font-weight', V3_Control::bind_to( 'typography_font_weight' )->set_dependencies( $custom_typography ) ),
	],
];
