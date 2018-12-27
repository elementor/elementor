<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\TemplateLibrary\Source_Local;

/**
 * Elementor scheme manager.
 *
 * Elementor scheme manager handler class is responsible for registering and
 * initializing all the supported schemes.
 *
 * @since 1.0.0
 */
class Schemes_Manager {

	/**
	 * Registered schemes.
	 *
	 * Holds the list of all the registered schemes.
	 *
	 * @access protected
	 *
	 * @var Scheme_Base[]
	 */
	protected $_registered_schemes = [];

	/**
	 * Enabled schemes.
	 *
	 * Holds the list of all the enabled schemes.
	 *
	 * @access private
	 * @static
	 *
	 * @var array
	 */
	private static $_enabled_schemes;

	/**
	 * Schemes types.
	 *
	 * Holds the list of the schemes types. Default types are `color`,
	 * `typography` and `color-picker`.
	 *
	 * @access private
	 * @static
	 *
	 * @var array
	 */
	private static $_schemes_types = [
		'color' => 'Scheme_Color',
		'typography' => 'Scheme_Typography',
		'color-picker' => 'Scheme_Color_Picker',
	];

	/**
	 * Register new scheme.
	 *
	 * Add a new scheme to the schemes list. The method creates a new scheme
	 * instance for any given scheme class and adds the scheme to the registered
	 * schemes list.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $scheme_class Scheme class name.
	 */
	public function register_scheme( $scheme_class ) {
		/** @var Scheme_Base $scheme_instance */
		$scheme_instance = new $scheme_class();

		$this->_registered_schemes[ $scheme_instance::get_type() ] = $scheme_instance;
	}

	/**
	 * Unregister scheme.
	 *
	 * Removes a scheme from the list of registered schemes.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $id Scheme ID.
	 *
	 * @return bool True if the scheme was removed, False otherwise.
	 */
	public function unregister_scheme( $id ) {
		if ( ! isset( $this->_registered_schemes[ $id ] ) ) {
			return false;
		}
		unset( $this->_registered_schemes[ $id ] );
		return true;
	}

	/**
	 * Get registered schemes.
	 *
	 * Retrieve the registered schemes list from the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return Scheme_Base[] Registered schemes.
	 */
	public function get_registered_schemes() {
		return $this->_registered_schemes;
	}

	/**
	 * Get schemes data.
	 *
	 * Retrieve all the registered schemes with data for each scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Registered schemes with each scheme data.
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
	 * Get default schemes.
	 *
	 * Retrieve all the registered schemes with default scheme for each scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Registered schemes with with default scheme for each scheme.
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
	 * Get system schemes.
	 *
	 * Retrieve all the registered schemes with system schemes for each scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Registered schemes with with system scheme for each scheme.
	 */
	public function get_system_schemes() {
		$data = [];

		foreach ( $this->get_registered_schemes() as $scheme ) {
			$data[ $scheme::get_type() ] = $scheme->get_system_schemes();
		}

		return $data;
	}

	/**
	 * Get scheme.
	 *
	 * Retrieve a single scheme from the list of all the registered schemes in
	 * the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $id Scheme ID.
	 *
	 * @return false|Scheme_Base Scheme instance if scheme exist, False otherwise.
	 */
	public function get_scheme( $id ) {
		$schemes = $this->get_registered_schemes();

		if ( ! isset( $schemes[ $id ] ) ) {
			return false;
		}
		return $schemes[ $id ];
	}

	/**
	 * Get scheme value.
	 *
	 * Retrieve the scheme value from the list of all the registered schemes in
	 * the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $scheme_type  Scheme type.
	 * @param string $scheme_value Scheme value.
	 *
	 * @return false|string Scheme value if scheme exist, False otherwise.
	 */
	public function get_scheme_value( $scheme_type, $scheme_value ) {
		$scheme = $this->get_scheme( $scheme_type );
		if ( ! $scheme ) {
			return false;
		}

		return $scheme->get_scheme_value()[ $scheme_value ];
	}

	/**
	 * Ajax apply scheme.
	 *
	 * Ajax handler for Elementor apply_scheme.
	 *
	 * Fired by `wp_ajax_elementor_apply_scheme` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function ajax_apply_scheme( $data ) {
		if ( ! User::is_current_user_can_edit_post_type( Source_Local::CPT ) ) {
			return false;
		}

		if ( ! isset( $data['scheme_name'] ) ) {
			return false;
		}

		$scheme_obj = $this->get_scheme( $data['scheme_name'] );

		if ( ! $scheme_obj ) {
			return false;
		}

		$posted = json_decode( $data['data'], true );

		$scheme_obj->save_scheme( $posted );

		return true;
	}

	/**
	 * Print schemes templates.
	 *
	 * Used to generate the scheme templates on the editor using Underscore JS
	 * template, for all the registered schemes.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function print_schemes_templates() {
		foreach ( $this->get_registered_schemes() as $scheme ) {
			$scheme->print_template();
		}
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'apply_scheme', [ $this, 'ajax_apply_scheme' ] );
	}
	/**
	 * Get enabled schemes.
	 *
	 * Retrieve all enabled schemes from the list of the registered schemes in
	 * the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Enabled schemes.
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

			/**
			 * Enabled schemes.
			 *
			 * Filters the list of enabled schemes.
			 *
			 * @since 1.0.0
			 *
			 * @param array $enabled_schemes The list of enabled schemes.
			 */
			$enabled_schemes = apply_filters( 'elementor/schemes/enabled_schemes', $enabled_schemes );

			self::$_enabled_schemes = $enabled_schemes;
		}
		return self::$_enabled_schemes;
	}

	/**
	 * Register default schemes.
	 *
	 * Add a default schemes to the register schemes list.
	 *
	 * This method is used to set initial schemes when initializing the class.
	 *
	 * @since 1.7.12
	 * @access private
	 */
	private function register_default_schemes() {
		foreach ( self::$_schemes_types as $schemes_class ) {
			$this->register_scheme( __NAMESPACE__ . '\\' . $schemes_class );
		}
	}

	/**
	 * Schemes manager constructor.
	 *
	 * Initializing Elementor schemes manager and register default schemes.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		$this->register_default_schemes();

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}
}
