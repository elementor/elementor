<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data;

use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Api_Wp_Error_Exception;
use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Api_Response_Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Api_Client {
	const DEFAULT_BASE_ENDPOINT = 'https://kits.dev.elementor.red';

	/**
	 * @var string
	 */
	private $base_endpoint;

	/**
	 * @var string|null
	 */
	private $license_key;

	/**
	 * Get all the kits
	 *
	 * @return array
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function get_all() {
		return $this->send_request( 'kits' );
	}

	/**
	 * Get all the taxonomies.
	 *
	 * @return array
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function get_taxonomies() {
		return $this->send_request( 'taxonomies' );
	}

	/**
	 * Get manifest data
	 *
	 * @param $id
	 *
	 * @return array
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function get_manifest( $id ) {
		return $this->send_request( "manifests/{$id}" );
	}

	/**
	 * @param $id
	 */
	public function download( $id ) {
		// TODO
	}

	/**
	 * Send a request.
	 *
	 * @param       $path
	 * @param array $query_args
	 *
	 * @return array
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function send_request( $path, $query_args = [] ) {
		$response = wp_remote_get(
			add_query_arg( $query_args, "{$this->base_endpoint}/{$path}" )
		);

		// Throw exception when something went wrong.
		if ( is_wp_error( $response ) ) {
			throw new Api_Wp_Error_Exception( $response );
		}

		$response_code = wp_remote_retrieve_response_code( $response );

		// Throw exception when the status code is not valid.
		if ( 200 < $response_code || 300 <= $response_code ) {
			throw new Api_Response_Exception( $response );
		}

		return json_decode( wp_remote_retrieve_body( $response ), true );
	}

	/**
	 * API constructor.
	 *
	 * @param string $base_endpoint
	 * @param string $license_key
	 */
	public function __construct( $base_endpoint, $license_key = null ) {
		$this->base_endpoint = $base_endpoint;
		$this->license_key   = $license_key;
	}
}
