<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Schemes_Manager {

	/**
	 * @var Scheme_Base[]
	 */
	protected $_registered_schemes = [];

	private static $_enabled_schemes;

	private static $_schemes_types = [
		'color' => 'Scheme_Color',
		'typography' => 'Scheme_Typography',
		'color-picker' => 'Scheme_Color_Picker',
	];

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function register_scheme( $scheme_class ) {
		/** @var Scheme_Base $scheme_instance */
		$scheme_instance = new $scheme_class();

		$this->_registered_schemes[ $scheme_instance::get_type() ] = $scheme_instance;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function unregister_scheme( $id ) {
		if ( ! isset( $this->_registered_schemes[ $id ] ) ) {
			return false;
		}
		unset( $this->_registered_schemes[ $id ] );
		return true;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_registered_schemes() {
		return $this->_registered_schemes;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
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

	/**
	 * @since 1.0.0
	 * @access public
	*/
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

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_system_schemes() {
		$data = [];

		foreach ( $this->get_registered_schemes() as $scheme ) {
			$data[ $scheme::get_type() ] = $scheme->get_system_schemes();
		}

		return $data;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_scheme( $id ) {
		$schemes = $this->get_registered_schemes();

		if ( ! isset( $schemes[ $id ] ) ) {
			return false;
		}
		return $schemes[ $id ];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_scheme_value( $scheme_type, $scheme_value ) {
		$scheme = $this->get_scheme( $scheme_type );
		if ( ! $scheme ) {
			return false;
		}

		return $scheme->get_scheme_value()[ $scheme_value ];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function ajax_apply_scheme() {
		if ( ! Plugin::$instance->editor->verify_request_nonce() ) {
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

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function print_schemes_templates() {
		foreach ( $this->get_registered_schemes() as $scheme ) {
			$scheme->print_template();
		}
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_enabled_schemes() {
		if ( null === self::$_enabled_schemes ) {
			$enabled_schemes = [];

			foreach ( self::$_schemes_types as $schemes_type => $scheme_class ) {
				if ( 'yes' === get_option( 'elementor_disable_' . $schemes_type . '_schemes' ) ) {
					continue;
				}
				$enabled_schemes[] = $schemes_type;
			}
			self::$_enabled_schemes = apply_filters( 'elementor/schemes/enabled_schemes', $enabled_schemes );
		}
		return self::$_enabled_schemes;
	}

	/**
	 * @since 1.7.12
	 * @access private
	*/
	private function register_default_schemes() {
		foreach ( self::$_schemes_types as $schemes_class ) {
			$this->register_scheme( __NAMESPACE__ . '\\' . $schemes_class );
		}
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function __construct() {
		$this->register_default_schemes();

		add_action( 'wp_ajax_elementor_apply_scheme', [ $this, 'ajax_apply_scheme' ] );
	}
}
