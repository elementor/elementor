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

		if ( ! isset( $config['handle'] ) ) {
			return $this;
		}

		$this->items[ $key ] = [
			'handle' => $config['handle'],
			'deps' => $config['deps'] ?? [],
		];

		return $this;
	}
}
