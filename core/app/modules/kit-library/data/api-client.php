<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data;

use Elementor\Plugin;
use Elementor\Core\Common\Modules\Connect\Apps\Connect;
use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Api_Wp_Error_Exception;
use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Api_Response_Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Api_Client {
	const DEFAULT_BASE_ENDPOINT = 'https://kits.dev.elementor.red';

	/**
	 * @var \WP_Http
	 */
	private $http;

	/**
	 * @var string
	 */
	private $base_endpoint;

	/**
	 * @var Connect
	 */
	private $connect;

	/**
	 * Get all the kits
	 *
	 * @return array
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function get_all() {
		return $this->send_request( 'GET', 'kits' );
	}

	/**
	 * Get all the taxonomies.
	 *
	 * @return array
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function get_taxonomies() {
		return $this->send_request( 'GET', 'taxonomies' );
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
		return $this->send_request( 'GET', "manifests/{$id}" );
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function download_link( $id ) {
		return $this->send_request( 'GET', "kits/{$id}/download-link", [
			'headers' => $this->get_headers_for_connect(),
		] );
	}

	/**
	 * Send a request.
	 *
	 * @param       $method
	 * @param       $path
	 * @param array $args
	 *
	 * @return mixed
	 * @throws Api_Response_Exception
	 * @throws Api_Wp_Error_Exception
	 */
	public function send_request( $method, $path, $args = [] ) {
		$args = array_merge_recursive( [
			'method' => $method,
			'headers' => [
				'X-Elementor-Local-Id' => get_current_user_id(),
				'X-Elementor-Home-Url' => trailingslashit( home_url() ),
			],
		], $args );

		$response = $this->http->request( "{$this->base_endpoint}/{$path}", $args );

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
	 * @param array $request_body
	 *
	 * @return array
	 */
	private function get_headers_for_connect( $request_body = [] ) {
		return [
			'X-Elementor-Access-Token' => $this->connect->get( 'access_token' ),
			'X-Elementor-Client-Id' => $this->connect->get( 'client_id' ),
			'X-Elementor-Site-Key' => $this->connect->get_site_key(),
			'X-Elementor-Signature' => hash_hmac(
				'sha256',
				wp_json_encode( $request_body, JSON_NUMERIC_CHECK ),
				$this->connect->get( 'access_token_secret' )
			),
		];
	}

	/**
	 * Api_Client constructor.
	 *
	 * @param $base_endpoint
	 */
	public function __construct( $base_endpoint ) {
		$this->http = new \WP_Http();
		$this->base_endpoint = $base_endpoint;

		add_action('rest_api_init', function () {
			$this->connect = Plugin::$instance->common
				->get_component( 'connect' )
				->get_app( 'connect' );
		}, 12 );
	}
}
