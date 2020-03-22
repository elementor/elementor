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
	public $editor_components = [];

	public function __construct() {
		$this->register_actions();
		$this->register_editor_commands();
	}

	public function get_name() {
		return 'data-manager';
	}

	private function register_actions() {
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}

	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'command-data', [ $this, 'ajax_command_data' ] );
	}

	public function register_editor_commands() {
		$editor_components_names = [];
		$editor_components_dir_path = __DIR__ . '/editor/';
		$editor_components_files = scandir( $editor_components_dir_path );

		foreach ( $editor_components_files as $editor_component_file ) {
			if ( '.' === $editor_component_file[0] ||  ! is_dir( $editor_components_dir_path . $editor_component_file ) ) {
				// Skip.
				continue;
			}

			$editor_components_names [] = ucfirst( $editor_component_file );
		}

		foreach ( $editor_components_names as $editor_component_name ) {
			$class_name = '\Elementor\Data\Editor' . '\\' . $editor_component_name . '\\' . 'Component';
			$component_instance = new $class_name( $this );

			$this->editor_components[ $component_instance->get_name() ] = $component_instance;
		}
	}

	public function ajax_command_data( array $data ) {
		// TODO: Validate editor.
		$component = $data['component'];
		$command = $data['command'];
		$type = isset( $data['type'] ) ? $data['type'] : 'get';

		if ( isset( $this->editor_components[ $component ] ) ) {
			$command_instance = null;
			$component_instance = $this->editor_components[ $component ];

			if ( isset( $component_instance->commands[ $command ] ) ) {
				$command_instance = $component_instance->commands[ $command ];
			}

			if ( $command_instance ) {
				return $command_instance->run( $type, $data );
			}
		}

		Ajax::instance()->send_error( 404 );
	}
}

