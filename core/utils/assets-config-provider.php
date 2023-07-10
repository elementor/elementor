<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Assets_Config_Provider extends Collection {

	/**
	 * Load asset config from a file into the collection.
	 *
	 * @param $key
	 * @param $path
	 *
	 * @return $this
	 */
	public function load( $key, $path ) {
		if ( ! file_exists( $path ) ) {
			return $this;
		}

		$config = require $path;

		if ( ! $this->is_valid_handle( $config ) ) {
			return $this;
		}

		$this->items[ $key ] = [
			'handle' => $config['handle'],
			'deps' => $this->is_valid_deps( $config ) ? $config['deps'] : [],
		];

		return $this;
	}

	/**
	 * Check that the handle property in the config is a valid.
	 *
	 * @param $config
	 *
	 * @return bool
	 */
	private function is_valid_handle( $config ) {
		return ! empty( $config['handle'] ) && is_string( $config['handle'] );
	}

	/**
	 * Check that the deps property in the config is a valid.
	 *
	 * @param $config
	 *
	 * @return bool
	 */
	private function is_valid_deps( $config ) {
		return isset( $config['deps'] ) && is_array( $config['deps'] );
	}
}
