<?php
namespace Elementor\Core;

use Elementor\Core\Base\Module;

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
class Modules_Manager {

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
	private $modules = [];

	/**
	 * Modules manager constructor.
	 *
	 * Initializing the Elementor modules manager.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		$modules_namespace_prefix = $this->get_modules_namespace_prefix();

		foreach ( $this->get_modules_names() as $module_name ) {
			$class_name = str_replace( '-', ' ', $module_name );

			$class_name = str_replace( ' ', '', ucwords( $class_name ) );

			$class_name = $modules_namespace_prefix . '\\Modules\\' . $class_name . '\Module';

			/** @var Module $class_name */
			if ( $class_name::is_active() ) {
				$this->modules[ $module_name ] = $class_name::instance();
			}
		}
	}

	public function get_modules_names() {
		return [
			'history',
			'library',
			'dynamic-tags',
			'page-templates',
		];
	}

	/**
	 * @param string $module_name
	 *
	 * @return Module|Module[]
	 */
	public function get_modules( $module_name ) {
		if ( $module_name ) {
			if ( isset( $this->modules[ $module_name ] ) ) {
				return $this->modules[ $module_name ];
			}

			return null;
		}

		return $this->modules;
	}

	protected function get_modules_namespace_prefix() {
		return 'Elementor';
	}
}
