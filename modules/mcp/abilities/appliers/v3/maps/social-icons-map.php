<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$icon = Style_Target::make( 'icon' )
	->label( 'Social icon buttons' )
	->bind( 'color', V3_Control::bind_to( 'icon_secondary_color' ) )
	->bind( 'background', V3_Control::bind_to( 'icon_primary_color' ) )
	->bind( 'font-size', V3_Control::bind_to( 'icon_size' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'icon_padding' )->responsive() )
	->bind( 'gap', V3_Control::bind_to( 'icon_spacing' )->responsive() );

return V3_Widget_Map::make( 'social-icons' )
	->description( 'Grid of linked social icons. Icon list items are edited in the editor; use shape, columns, and alignment here.' )
	->settings( [
		'shape' => V3_Setting::bind_to( 'shape' )->enum_from_control(),
		'columns' => V3_Setting::bind_to( 'columns' )->enum_from_control(),
		'align' => V3_Setting::bind_to( 'align' )->enum_from_control(),
	] )
	->default_target( $icon );
