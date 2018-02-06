<?php
namespace Elementor\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor modules manager class.
 *
 * Elementor modules manager handler class is responsible for registering and
 * managing Elementor modules.
 *
 * @since 1.6.0
 */
final class Modules_Manager {

	/**
	 * Registered modules.
	 *
	 * Holds the list of all the registered modules.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @var array
	 */
	private $modules = null;

	/**
	 * Modules manager constructor.
	 *
	 * Initializing the Elementor modules manager.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		$modules = [
			'history',
			'debug-mode',
		];

		foreach ( $modules as $module_id ) {
			$class_name = str_replace( '-', ' ', $module_id );
			$class_name = str_replace( ' ', '', ucwords( $class_name ) );
			$class_name = 'Elementor\\Modules\\' . $class_name . '\Module';

			$this->modules[ $module_id ] = $class_name::instance();
		}
	}
}
