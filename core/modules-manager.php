<?php
namespace Elementor\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

final class Modules_Manager {

	private $modules = null;

	public function __construct() {
		$modules = [];

		foreach ( $modules as $module_id ) {
			$class_name = str_replace( '-', ' ', $module_id );
			$class_name = str_replace( ' ', '', ucwords( $class_name ) );
			$class_name = 'Elementor\\Modules\\' . $class_name . '\Module';

			$this->modules[ $module_id ] = $class_name::instance();
		}
	}
}
