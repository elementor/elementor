<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Schemes_Manager {

	/**
	 * @var Scheme_Base[]
	 */
	protected $_registered_schemes = [];

	private static $_enabled_schemes;

	private static $_schemes_types = [
		'color',
		'typography',
		'color-picker',
	];

	public function register_scheme( $scheme_class ) {
		if ( ! class_exists( $scheme_class ) ) {
			return new \WP_Error( 'scheme_class_name_not_exists' );
		}

		$scheme_instance = new $scheme_class();

		if ( ! $scheme_instance instanceof Scheme_Base ) {
			return new \WP_Error( 'wrong_instance_scheme' );
		}

		$this->_registered_schemes[ $scheme_instance::get_type() ] = $scheme_instance;

		return true;
	}

	public function unregister_scheme( $id ) {
		if ( ! isset( $this->_registered_schemes[ $id ] ) ) {
			return false;
		}
		unset( $this->_registered_schemes[ $id ] );
		return true;
	}

	public function get_registered_schemes() {
		return $this->_registered_schemes;
	}

	public function get_registered_schemes_data() {
		$data = [];

		foreach ( $this->get_registered_schemes() as $scheme ) {
			$data[ $scheme::get_type() ] = [
				'title' => $scheme->get_title(),
				'disabled_title' => $scheme->get_disabled_title(),
				'items' => $scheme->get_scheme(),
			];
		}

		return $data;
	}

	public function get_schemes_defaults() {
		$data = [];

		foreach ( $this->get_registered_schemes() as $scheme ) {
			$data[ $scheme::get_type() ] = [
				'title' => $scheme->get_title(),
				'items' => $scheme->get_default_scheme(),
			];
		}

		return $data;
	}

	public function get_system_schemes() {
		$data = [];

		foreach ( $this->get_registered_schemes() as $scheme ) {
			$data[ $scheme::get_type() ] = $scheme->get_system_schemes();
		}

		return $data;
	}

	public function get_scheme( $id ) {
		$schemes = $this->get_registered_schemes();

		if ( ! isset( $schemes[ $id ] ) ) {
			return false;
		}
		return $schemes[ $id ];
	}

	public function get_scheme_value( $scheme_type, $scheme_value ) {
		$scheme = $this->get_scheme( $scheme_type );
		if ( ! $scheme )
			return false;

		return $scheme->get_scheme_value()[ $scheme_value ];
	}

	public function ajax_apply_scheme() {
		if ( empty( $_POST['_nonce'] ) || ! wp_verify_nonce( $_POST['_nonce'], 'elementor-editing' ) ) {
			wp_send_json_error( new \WP_Error( 'token_expired' ) );
		}

		if ( ! isset( $_POST['scheme_name'] ) ) {
			wp_send_json_error();
		}

		$scheme_obj = $this->get_scheme( $_POST['scheme_name'] );
		if ( ! $scheme_obj ) {
			wp_send_json_error();
		}
		$posted = json_decode( stripslashes( $_POST['data'] ), true );
		$scheme_obj->save_scheme( $posted );

		wp_send_json_success();
	}

	public function print_schemes_templates() {
		foreach ( $this->get_registered_schemes() as $scheme ) {
			$scheme->print_template();
		}
	}

	public static function get_enabled_schemes() {
		if ( null === self::$_enabled_schemes ) {
			$enabled_schemes = [];

			foreach ( self::$_schemes_types as $schemes_type ) {
				if ( 'yes' === get_option( 'elementor_disable_' . $schemes_type . '_schemes' ) ) {
					continue;
				}
				$enabled_schemes[] = $schemes_type;
			}
			self::$_enabled_schemes = apply_filters( 'elementor/schemes/enabled_schemes', $enabled_schemes );
		}
		return self::$_enabled_schemes;
	}

	private function register_default_schemes() {
		include( ELEMENTOR_PATH . 'includes/interfaces/scheme.php' );

		include( ELEMENTOR_PATH . 'includes/schemes/base.php' );

		foreach ( self::$_schemes_types as $schemes_type ) {
			include( ELEMENTOR_PATH . 'includes/schemes/' . $schemes_type . '.php' );

			$this->register_scheme( __NAMESPACE__ . '\Scheme_' . ucfirst( str_replace( '-', '_', $schemes_type ) ) );
		}
	}

	public function __construct() {
		$this->register_default_schemes();

		add_action( 'wp_ajax_elementor_apply_scheme', [ $this, 'ajax_apply_scheme' ] );
	}
}
