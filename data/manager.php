<?php

namespace Elementor\Data;

use Elementor\Core\Base\Module as BaseModule;
use \Elementor\Data\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * TODO: Manager should know if its `editor/admin/frontend` and register the right commands.
 */
class Manager extends BaseModule {
	public $controllers = [];

	public function __construct() {
		$this->register_editor_controllers();
	}

	public function get_name() {
		return 'data-manager';
	}

	public function register_editor_controllers() {
		$this->register_controller( Editor\Document\Controller::class );
		$this->register_controller( Editor\Globals\Controller::class );
	}

	private function register_controller( $controller_class_name ) {
		$controller_instance = new $controller_class_name();

		$this->controllers[ $controller_instance->get_name() ] = $controller_instance;
	}
}

