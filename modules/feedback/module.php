<?php

namespace Elementor\Modules\Feedback;

use Elementor\Core\Base\Module as Module_Base;
use Elementor\Modules\Feedback\Data\Controller;
use Elementor\Plugin;
use Elementor\Api;
use Elementor\Core\Common\Modules\Connect\Rest\Rest_Api;
use Elementor\Utils;
use http\Cookie as HttpCookie;
use WP_Http_Cookie;
use WpOrg\Requests\Cookie;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends Module_Base {

	public function __construct() {
		add_action( 'rest_api_init', fn() => self::register_routes() );
	}

	protected function register_routes() {
		register_rest_route( 'elementor/v1/feedback', '/submit', [
			'methods' => 'POST',
			'callback' => fn( $request ) => $this->handle_submit( $request ),
			'permission_callback' => '__return_true',
		] );
	}

	protected function handle_submit( $request, $additional_cookies = [] ) {
		$user_meta = get_user_meta( get_current_user_id(), 'wp_elementor_connect_common_data' );
		$app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'feedback' );
		$body = [
			'title' => 'Editor Feedback',
			'description' => $request->get_param( 'description' ),
			'product' => 'EDITOR',
			'subject' => 'Editor Feedback',
		];

		$response = $app->submit( $body );
		$response_code = $response['response']['code'];
		if ( 'OK' === $response['response']['message'] ) {
			return [
				'success' => true,
				'code' => $response_code,
				'message' => esc_html__( 'Feedback submitted successfully.', 'elementor' ),
			];
		} else {
			$message = $response['data']['message'] ?? esc_html__( 'Failed to submit feedback.', 'elementor' );
			return [
				'success' => false,
				'code' => $response_code,
				'message' => $message,
			];
		}
	}
	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'feedback';
	}
}
