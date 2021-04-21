<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Core\App\Modules\KitLibrary\Data\Repository;
use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Api_Response_Exception;
use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Kit_Not_Found_Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Kits_Favorites extends Endpoint {
	public function get_name() {
		return 'favorites';
	}

	protected function register() {
		$this->register_route(
			'/(?P<id>[\w-]+)/',
			\WP_REST_Server::CREATABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::CREATABLE, $request, false );
			},
			[
				'id' => [
					'description' => 'Unique identifier for the object.',
					'type' => 'string',
					'required' => true,
				],
			]
		);

		$this->register_route(
			'/(?P<id>[\w-]+)/',
			\WP_REST_Server::DELETABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::DELETABLE, $request, false );
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

	/**
	 * @param string           $id
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_Error|\WP_REST_Response
	 */
	public function create_item( $id, $request ) {
		/** @var Repository $repository */
		$repository = $this->controller->repository;

		try {
			$kit = $repository->add_to_favorite( get_current_user_id(), $id );
		} catch ( Api_Response_Exception $exception ) {
			return new \WP_Error( 'http_response_error', __( 'Connection error.', 'elementor' ), [ 'status' => 500 ] );
		} catch ( Kit_Not_Found_Exception $exception ) {
			return new \WP_Error( 'not_found', $exception->getMessage(), [ 'status' => $exception->getCode() ] );
		} catch ( \Exception $exception ) {
			return new \WP_Error( 'server_error', __( 'Something went wrong.', 'elementor' ), [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( [
			'data' => $kit,
		] );
	}

	/**
	 * @param string           $id
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_Error|\WP_REST_Response
	 */
	public function delete_item( $id, $request ) {
		/** @var Repository $repository */
		$repository = $this->controller->repository;

		try {
			$kit = $repository->remove_from_favorite( get_current_user_id(), $id );
		} catch ( Api_Response_Exception $exception ) {
			return new \WP_Error( 'http_response_error', __( 'Connection error.', 'elementor' ), [ 'status' => 500 ] );
		} catch ( Kit_Not_Found_Exception $exception ) {
			return new \WP_Error( 'not_found', $exception->getMessage(), [ 'status' => $exception->getCode() ] );
		} catch ( \Exception $exception ) {
			return new \WP_Error( 'server_error', __( 'Something went wrong.', 'elementor' ), [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( [
			'data' => $kit,
		] );
	}
}
