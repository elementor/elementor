<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Advanced_Wrapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return V3_Widget_Map::make( 'shortcode' )
	->description( 'Renders a WordPress shortcode, e.g. [contact-form-7 id="1"]. Styles apply to the widget wrapper only.' )
	->settings( [
		'shortcode' => V3_Setting::bind_to( 'shortcode' )->string()->dynamic(),
	] )
	->default_target( Advanced_Wrapper::target() );
