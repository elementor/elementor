<?php
namespace Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor scheme manager.
 *
 * Elementor scheme manager handler class is responsible for registering and
 * initializing all the supported schemes.
 *
 * @since 1.0.0
 */
class Manager {

	/**
	 * Registered schemes.
	 *
	 * Holds the list of all the registered schemes.
	 *
	 * @access protected
	 *
	 * @var Base[]
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
		'color',
		'typography',
		'color-picker',
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
	 * @deprecated 3.0.0
	 *
	 * @param string $scheme_class Scheme class name.
	 */
	public function register_scheme( $scheme_class ) {}

	/**
	 * Unregister scheme.
	 *
	 * Removes a scheme from the list of registered schemes.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @param string $id Scheme ID.
	 *
	 * @return bool True if the scheme was removed, False otherwise.
	 */
	public function unregister_scheme( $id ) {
		return true;
	}

	/**
	 * Get registered schemes.
	 *
	 * Retrieve the registered schemes list from the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 */
	public function get_registered_schemes() {
		return [];
	}

	/**
	 * Get schemes data.
	 *
	 * Retrieve all the registered schemes with data for each scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @return array Registered schemes with each scheme data.
	 */
	public function get_registered_schemes_data() {
		return [];
	}

	/**
	 * Get default schemes.
	 *
	 * Retrieve all the registered schemes with default scheme for each scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @return array Registered schemes with with default scheme for each scheme.
	 */
	public function get_schemes_defaults() {
		return [];
	}

	/**
	 * Get system schemes.
	 *
	 * Retrieve all the registered ui schemes with system schemes for each scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @return array Registered ui schemes with with system scheme for each scheme.
	 */
	public function get_system_schemes() {
		return [];
	}

	/**
	 * Get scheme.
	 *
	 * Retrieve a single scheme from the list of all the registered schemes in
	 * the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @param string $id Scheme ID.
	 */
	public function get_scheme( $id ) {
		return false;
	}

	/**
	 * Get scheme value.
	 *
	 * Retrieve the scheme value from the list of all the registered schemes in
	 * the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @param string $scheme_type  Scheme type.
	 * @param string $scheme_value Scheme value.
	 */
	public function get_scheme_value( $scheme_type, $scheme_value ) {
		return false;
	}

	/**
	 * Print ui schemes templates.
	 *
	 * Used to generate the scheme templates on the editor using Underscore JS
	 * template, for all the registered ui schemes.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 */
	public function print_schemes_templates() {}

	/**
	 * Get enabled schemes.
	 *
	 * Retrieve all enabled schemes from the list of the registered schemes in
	 * the current instance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 * @static
	 *
	 * @return array Enabled schemes.
	 */
	public static function get_enabled_schemes() {
		return [];
	}
}
