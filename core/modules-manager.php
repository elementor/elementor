<?php
namespace Elementor\Core;

use Elementor\Core\Base\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Modules_Manager {

	private $modules = [];

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		foreach ( $this->get_modules_names() as $module_name ) {
			$class_name = str_replace( '-', ' ', $module_name );

			$class_name = str_replace( ' ', '', ucwords( $class_name ) );
	
			$class_name = $this->get_modules_namespace_prefix() . '\\Modules\\' . $class_name . '\Module';

			/** @var Module $class_name */
			if ( $class_name::is_active() ) {
				$this->modules[ $module_name ] = $class_name::instance();
			}
		}
	}

	public function get_modules_names() {
		return [
			'history',
			'tags',
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
