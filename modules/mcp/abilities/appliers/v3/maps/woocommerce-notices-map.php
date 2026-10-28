<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Woocommerce_Notice_Targets;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$notice_targets = Woocommerce_Notice_Targets::all();

return V3_Widget_Map::make( 'woocommerce-notices' )
	->description( 'Where WooCommerce notices (errors, success messages and info) show on the page. Its styles apply to every WooCommerce notice on the site, not only this widget.' )
	->default_target( array_shift( $notice_targets ) )
	->targets( ...$notice_targets );
