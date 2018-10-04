<?php

namespace Elementor\Core\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class App extends Module {

	final protected function print_config() {
		$name = $this->get_name();

		wp_localize_script( 'elementor-' . $name, 'elementor' . ucfirst( $name ) . 'Config', $this->get_settings() + $this->get_components_config() );
	}

	private function get_components_config() {
		$settings = [];

		foreach ( $this->get_components() as $id => $instance ) {
			$settings[ $id ] = $instance->get_settings();
		}

		return $settings;
	}
}
