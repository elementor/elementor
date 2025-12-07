<?php

namespace Elementor\Modules\Feedback;

use Elementor\Core\Base\Module as Module_Base;
use Elementor\Modules\Feedback\Data\Controller;
use Elementor\Plugin;
use Elementor\Api;
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

  protected function handle_submit( $request, $additional_cookies = [] ) {
    $ENDPOINT_URL = 'https://my.elementor.com/feedback/api/v1/product-feedback';

    $user_meta = get_user_meta( get_current_user_id(), 'wp_elementor_connect_common_data' );

    $jwt_token = $this->parseJWT( $user_meta[ 0 ][ 'access_token' ] );

    $token_cookie = new \WP_Http_Cookie('DSR');
    $token_cookie->name = 'DSR';
    $token_cookie->value = $user_meta[ 0 ]['access_token'];
    
    $cookies = array_merge( $additional_cookies, [ $token_cookie ]);


		$response = wp_remote_post( $ENDPOINT_URL, [
      'header' => [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
        'app' => 'library',
        'endpoint' => 'taxonomy',
        'home-url' => $jwt_token[ 'aud' ]
      ],
      'cookies' => $cookies,
			'body' => [
				'title' => 'Editor Feedback',
				'description' => $request->get_param( 'description' ),
				'product' => 'EDITOR',
        'subject' => 'Editor Feedback'
			]
		]);

    $responseCookies = $response->cookies;
    if ( $response['response']['code'] === 401) {
      $cookie_string = implode('; ', 
        array_merge($response['headers']['set-cookie'], [ $token_cookie->name . '=' . $token_cookie->value ]));
      $response = wp_remote_post( $ENDPOINT_URL, [
      'header' => [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
        'app' => 'library',
        'endpoint' => 'taxonomy',
        'home-url' => $jwt_token[ 'aud' ],
        'cookie' => $cookie_string
      ],
			'body' => [
				'title' => 'Editor Feedback',
				'description' => $request->get_param( 'description' ),
				'product' => 'EDITOR',
        'subject' => 'Editor Feedback'
			]
		]);
    }
    return $response;
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