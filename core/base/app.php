<?php

namespace Elementor\Core\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Base App
 *
 * Base app utility class that provides shared functionality of apps.
 *
 * @since 2.3.0
 */
abstract class App extends Module {

	/**
	 * Print config.
	 *
	 * Used to print the app and its components settings as a JavaScript object.
	 *
	 * @access protected
	 */
	final protected function print_config() {
		$name = $this->get_name();

		wp_localize_script( 'elementor-' . $name, 'elementor' . ucfirst( $name ) . 'Config', $this->get_settings() + $this->get_components_config() );
	}

	/**
	 * Get components config.
	 *
	 * Retrieves the app components settings.
	 *
	 * @access private
	 *
	 * @return array
	 */
	private function get_components_config() {
		$settings = [];

		foreach ( $this->get_components() as $id => $instance ) {
			$settings[ $id ] = $instance->get_settings();
		}

		return $settings;
	}
}
