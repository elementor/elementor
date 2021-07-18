<?php
namespace Elementor\Modules\DefaultValues\Data;

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
		//
	}

	/**
	 * Create new default value.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return object|\WP_Error
	 * @throws \Exception
	 */
	public function create_item( $request ) {
		try {
			return (object) Repository::instance()->store(
				$request->get_param( 'type' ),
				$request->get_param( 'settings' )
			);
		} catch ( Kit_Not_Exists $exception ) {
			return new \WP_Error( 'kit_not_exists', $exception->getMessage(), [ 'status' => 500 ] );
		}
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return object|\WP_Error
	 * @throws \Exception
	 */
	public function delete_item( $request ) {
		try {
			return (object) Repository::instance()->delete(
				$request->get_param( 'type' )
			);
		} catch ( Kit_Not_Exists $exception ) {
			return new \WP_Error( 'kit_not_exists', $exception->getMessage(), [ 'status' => 500 ] );
		}
	}
}
