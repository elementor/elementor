<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Assets_Config_Provider {
	/**
	 * @var array
	 */
	private $cache = [];

	/**
	 * @var string|null
	 */
	private $base_path;

	/**
	 * @param string $base_path
	 */
	public function __construct( $base_path = null ) {
		$this->base_path = $base_path;
	}

	public function get( $id, $base_path = null ) {
		if ( array_key_exists( $id, $this->cache ) ) {
			return $this->cache[ $id ];
		}

		$base_path = $base_path ? $base_path : $this->base_path;

		$path = "{$base_path}{$id}.assets.php";

		if ( ! file_exists( $path ) ) {
			$this->cache[ $id ] = null;

			return null;
		}

		$config = require $path;

		$this->cache[ $id ] = [
			'handle' => $config['handle'],
			'deps' => $config['deps'],
		];

		return $this->cache[ $id ];
	}
}
