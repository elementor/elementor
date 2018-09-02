<?php

namespace Elementor\Core\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class App extends Module {

	final protected function get_assets_url( $file_name, $file_extension, $relative_url = null, $add_suffix = true ) {
		static $suffix = null;

		if ( null === $suffix ) {
			$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) ? '' : '.min';
		}

		if ( ! $relative_url ) {
			$relative_url = $this->get_assets_relative_url() . $file_extension . '/';
		}

		$url = ELEMENTOR_URL . $relative_url . $file_name;

		if ( $add_suffix ) {
			$url .= $suffix;
		}

		return $url . '.' . $file_extension;
	}

	final protected function get_js_assets_url( $file_name, $relative_url = null, $add_suffix = true ) {
		return $this->get_assets_url( $file_name, 'js', $relative_url, $add_suffix );
	}

	final protected function get_css_assets_url( $file_name, $relative_url = null, $add_suffix = true ) {
		return $this->get_assets_url( $file_name, 'css', $relative_url, $add_suffix );
	}

	final protected function print_config() {
		$name = $this->get_name();

		wp_localize_script( 'elementor-' . $name, 'elementor' . ucfirst( $name ) . 'Config', $this->get_settings() + $this->get_components_config() );
	}

	protected function get_assets_relative_url() {
		return 'assets/';
	}

	private function get_components_config(){
		$settings = [];

		foreach ( $this->get_components() as $id => $instance ) {
			$settings[ $id ] = $instance->get_settings();
		}

		return $settings;
	}
}
