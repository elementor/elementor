<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Core\App\Modules\KitLibrary\Data\Repository;
use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Api_Response_Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Kits_Download_Link extends Endpoint {
	public function get_name() {
		return 'download-link';
	}

	protected function register() {
		$this->register_route(
			'/(?P<id>[\w-]+)/',
			\WP_REST_Server::READABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::READABLE, $request, false );
			},
			[
				'id' => [
					'description' => 'Unique identifier for the object.',
					'type' => 'string',
					'required' => true,
				],
			]
		);
	}

	public function get_item( $id, $request ) {
		/** @var Repository $repository */
		$repository = $this->controller->repository;

		try {
			$data = $repository->get_download_link( $id );
		} catch ( Api_Response_Exception $exception ) {
			return new \WP_Error( 'http_response_error', __( 'Connection error.', 'elementor' ) );
		} catch ( \Exception $exception ) {
			return new \WP_Error( 'server_error', __( 'Something went wrong.', 'elementor' ) );
		}

		return new \WP_REST_Response( [
			'data' => $data,
		] );
	}
}
