<?php

namespace Elementor\Modules\Feedback;

use Elementor\Core\Base\Module as Module_Base;
use Elementor\Modules\Feedback\Data\Controller;
use Elementor\Plugin;
use Elementor\Api;
use Elementor\Utils;

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

  private function parseJWT( string $token ): ?array {
    $parts = explode( '.', $token );
    if ( count( $parts ) !== 3 ) {
      return null;
    }

    $payload = $parts[ 1 ];
    $decoded = base64_decode( strtr( $payload, '-_', '+/' ) );
    if ( $decoded === false ) {
      return null;
    }

    $data = json_decode( $decoded, true );
    if ( json_last_error() !== JSON_ERROR_NONE ) {
      return null;
    }

    return $data;
  }

  protected function handle_submit( $request ) {
    $ENDPOINT_URL = Api::$api_feedback_url;
    // 'https://ebs-feedback.new-stg.elementor.red/v1/product-feedback'; // 

    $user_meta = get_user_meta( get_current_user_id(), 'wp_elementor_connect_common_data' );

    $jwt_token = $this->parseJWT( $user_meta[ 'access_token' ] );


		return wp_remote_post( $ENDPOINT_URL, [
      'header' => [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
        'access-token' => $user_meta[ 'access_token' ],
        'app' => 'library',
        'endpoint' => 'taxonomy',
        'home-url' => $jwt_token[ 'aud' ]
      ],
      'cookies' => [
        'CF_Authorization' => $user_meta['access_token']
      ],
			'body' => [
				'title' => 'Editor Feedback',
				'description' => $request->get_param( 'description' ),
				'product' => 'EDITOR',
        'subject' => 'Editor Feedback'
			]
		]);
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