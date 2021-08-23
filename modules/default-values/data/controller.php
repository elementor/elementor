<?php
namespace Elementor\Modules\DefaultValues\Data;

use Elementor\Plugin;
use Elementor\Core\Kits\Exceptions\Kit_Not_Exists;
use Elementor\Data\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {
	public function get_name() {
		return 'default-values';
	}

	protected function register_internal_endpoints() {
		$this->register_endpoint( Endpoints\Index::class );
	}

	public function register_endpoints() {
		// Must extend this method.
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
			return new \WP_Error( 'kit_not_exists', $exception->getMessage(), [ 'status' => 500 ] );
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
			return new \WP_Error( 'kit_not_exists', $exception->getMessage(), [ 'status' => 500 ] );
		}
	}
}
