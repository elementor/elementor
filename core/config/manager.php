<?php

namespace Elementor\Core\Config;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends BaseModule {

	private $registered = [];

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/init', function() {
			do_action( 'elementor/config/register', $this );
		}, 0 );

		add_action( 'activate_plugin', function() {
			$this->is_plugin_activation = true;
		}, 0 );
	}

	public function get_name() {
		return 'config';
	}

	static public function is_admin(): bool {
		$current_action = current_action();

		$is_plugin_activation = strpos( $current_action, 'activate_' ) === 0;

		return is_admin() || $is_plugin_activation;
	}

	/**
	 * @param Config_Base|string $classname
	 */
	public function register( $classname ) {
		$this->registered[ $classname::get_key() ] = $classname;

		if ( method_exists( $classname, 'on_register' ) ) {
			$classname::on_register();
		}
	}

	/**
	 * @param $key
	 *
	 * @return Config_Base
	 */
	public function get( $key ) {
		if ( ! isset( $this->registered[ $key ] ) ) {
			throw new \Error( esc_attr( $key ) . ' is not a valid config.' );
		}

		return $this->registered[ $key ];
	}

	public function get_all() {
		return $this->registered;
	}
}
