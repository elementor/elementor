<?php

namespace Elementor\Core\Options;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends BaseModule {

	private $registered = [];

	public function __construct() {
		parent::__construct();

		do_action( 'elementor/options/register', $this );
	}

	public function get_name() {
		return 'options';
	}

	/**
	 * @param Option_Base|string $classname
	 */
	public function register( $classname ) {
		$this->registered[ $classname::get_key() ] = $classname::get_key();
	}

	/**
	 * @param $key
	 *
	 * @return Option_Base
	 */
	public function get( $key ) {
		if ( ! isset( $this->registered[ $key ] ) ) {
			throw new \Error( esc_attr( $key ) . ' is not a valid option.' );
		}

		return $this->registered[ $key ];
	}

	public function get_all() {
		return $this->registered;
	}
}
