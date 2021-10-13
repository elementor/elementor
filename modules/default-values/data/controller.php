<?php
namespace Elementor\Modules\DefaultValues\Data;

use Elementor\Data\V2\Base\Exceptions\Error_404;
use Elementor\Plugin;
use Elementor\Core\Kits\Exceptions\Kit_Not_Exists;
use Elementor\Data\V2\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {
	public function get_name() {
		return 'default-values';
	}

	public function register_endpoints() {
		$type_validate_callback = function ( $param ) {
			$types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

			return in_array( $param, $types, true );
		};

		$this->index_endpoint->register_item_route(
			\WP_REST_Server::CREATABLE,
			[
				'id_arg_name' => 'type',
				'id_arg_type_regex' => '[\w]+',
				'type' => [
					'description' => 'Unique identifier for the object.',
					'required' => true,
					'type' => 'string',
					'validate_callback' => $type_validate_callback,
				],
				'settings' => [
					'description' => 'All the default values for the requested type',
					'required' => true,
					'type' => 'object',
				],
			]
		);

		$this->index_endpoint->register_item_route(
			\WP_REST_Server::DELETABLE,
			[
				'id_arg_name' => 'type',
				'id_arg_type_regex' => '[\w]+',
				'type' => [
					'description' => 'Unique identifier for the object.',
					'required' => true,
					'type' => 'string',
					'validate_callback' => $type_validate_callback,
				],
			]
		);
	}

	public function create_item( $request ) {
		try {
			$response = Repository::instance()->store(
				$request->get_param( 'type' ),
				$request->get_param( 'settings' )
			);

			Plugin::$instance->files_manager->clear_cache();

			return (object) $response;
		} catch ( Kit_Not_Exists $exception ) {
			return new Error_404( __( 'Kit not exists.', 'elementor' ), 'kit_not_exists' );
		}
	}

	public function delete_item( $request ) {
		try {
			$response = Repository::instance()->delete(
				$request->get_param( 'type' )
			);

			Plugin::$instance->files_manager->clear_cache();

			return (object) $response;
		} catch ( Kit_Not_Exists $exception ) {
			return new Error_404( __( 'Kit not exists.', 'elementor' ), 'kit_not_exists' );
		}
	}
}
