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
	public $editor_controllers = [];

	public function __construct() {
		$this->register_editor_controllers();
	}

	public function get_name() {
		return 'data-manager';
	}

	public function register_editor_controllers() {
		$this->register_controller( Editor\Document\Controller::class, $this->editor_controllers );
		$this->register_controller( Editor\Globals\Controller::class, $this->editor_controllers );
	}

	/**
	 * @param $controller_class_name
	 * @param array &$target
	 */
	private function register_controller( $controller_class_name, array & $target ) {
		$controller_instance = new $controller_class_name( $this );

		$target[ $controller_instance->get_name() ] = $controller_instance;
	}

	public function get_editor_endpoint( $controller, $command ) {
		if ( isset( $this->editor_controllers[ $controller ] ) ) {
			$endpoint_instance = null;
			$controller_instance = $this->editor_controllers[ $controller ];

			if ( isset( $controller_instance->commands[ $command ] ) ) {
				return $controller_instance->commands[ $command ];
			}
		}

		return false;
	}
}

