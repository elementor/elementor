<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$output = Style_Target::make( 'output' )
	->label( 'Shortcode output container (no widget-specific style controls)' );

return V3_Widget_Map::make( 'shortcode' )
	->description( 'Runs a WordPress shortcode string. Put styling on a parent container or in the shortcode output.' )
	->settings( [
		'shortcode' => V3_Setting::bind_to( 'shortcode' )->string(),
	] )
	->default_target( $output );
