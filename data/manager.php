<?php

namespace Elementor\Data;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * TODO: Manager should know if its `editor/admin/frontend` and register the right commands.
 */
class Manager extends BaseModule {
	public $editor_controllers = [];

	public function __construct() {
		//$this->register_actions();
		$this->register_editor_controllers();
	}

	public function get_name() {
		return 'data-manager';
	}

	//private function register_actions() {
	//	add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	//}

	//public function register_ajax_actions( Ajax $ajax ) {
	//	$ajax->register_ajax_action( 'command-data', [ $this, 'ajax_command_data' ] );
	//}

	public function register_editor_controllers() {
		$editor_controllers_names = [];
		$editor_controllers_dir_path = __DIR__ . '/editor/';
		$editor_controllers_files = scandir( $editor_controllers_dir_path );

		foreach ( $editor_controllers_files as $editor_controller_file ) {
			if ( '.' === $editor_controller_file[0] ||  ! is_dir( $editor_controllers_dir_path . $editor_controller_file ) ) {
				// Skip.
				continue;
			}

			$editor_controllers_names [] = ucfirst( $editor_controller_file );
		}

		foreach ( $editor_controllers_names as $editor_controller_name ) {
			$controller_class_name = '\Elementor\Data\Editor' . '\\' . $editor_controller_name . '\\' . 'Controller';
			$controller_instance = new $controller_class_name( $this );

			$this->editor_controllers[ $controller_instance->get_name() ] = $controller_instance;
		}
	}

	//public function ajax_command_data( array $data ) {
	//	// TODO: Validate editor.
	//	$component = $data['component'];
	//	$command = $data['command'];
	//	$type = isset( $data['type'] ) ? $data['type'] : 'get';
	//
	//	if ( isset( $this->editor_controllers[ $component ] ) ) {
	//		$command_instance = null;
	//		$component_instance = $this->editor_controllers[ $component ];
	//
	//		if ( isset( $component_instance->commands[ $command ] ) ) {
	//			$command_instance = $component_instance->commands[ $command ];
	//		}
	//
	//		if ( $command_instance ) {
	//			return $command_instance->run( $type, $data );
	//		}
	//	}
	//
	//	Ajax::instance()->send_error( 404 );
	//}
}

