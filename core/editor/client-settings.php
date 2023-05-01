<?php
namespace Elementor\Core\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Client_Settings {
	private $settings = [];

	public function register( $key, $settings ) {
		if ( isset( $this->settings[ $key ] ) ) {
			throw new \Exception( 'Client settings for key `' . $key . '` are already registered' );
		}

		$this->settings[ $key ] = $settings;

		return $this;
	}

	public function get() {
		return $this->settings;
	}
}
