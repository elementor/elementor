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

		if ( method_exists( $classname, 'on_change' ) ) {
			$option_name = $classname::get_full_key();

			add_action( "add_option_{$option_name}", function( $option, $value ) use ( $classname ) {
				$classname::on_change( $value );
			}, 10, 2 );

			add_action( "update_option_{$option_name}", function( $old_value, $value ) use ( $classname ) {
				$classname::on_change( $value, $old_value );
			}, 10, 2 );
		}
	}

	/**
	 * @param $key
	 *
	 * @return Option_Base
	 * @throws \Exception
	 */
	public function get( $key ) {
		if ( ! isset( $this->registered[ $key ] ) ) {
			throw new \Exception( esc_attr( $key ) . ' is not a valid option.' );
		}

		return $this->registered[ $key ];
	}

	public function get_all() {
		return $this->registered;
	}
}
