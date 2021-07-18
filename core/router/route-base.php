<?php
namespace Elementor\Core\Router;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Route_Base {

	public function get_name() {
		return 'route-base';
	}

	abstract public function get_conditions( $current_location, $args = [] );

	abstract public function get_wp_action();

	abstract public function apply();
}
