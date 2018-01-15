<?php
namespace Elementor\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

final class Modules_Manager {

	private $modules = null;

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		$modules = [
			'history'
		];

		foreach ( $modules as $module_id ) {
			$class_name = str_replace( '-', ' ', $module_id );
			$class_name = str_replace( ' ', '', ucwords( $class_name ) );
			$class_name = 'Elementor\\Modules\\' . $class_name . '\Module';

			$this->modules[ $module_id ] = $class_name::instance();
		}
	}
}
