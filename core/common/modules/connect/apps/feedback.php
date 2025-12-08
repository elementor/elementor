<?php

namespace Elementor\Core\Common\Modules\Connect\Apps;

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly.
}

class Feedback extends Common_App {

  const FEEDBACK_ENDPOINT = 'https://my.elementor.com/feedback/api/v1';

  public function get_title() {
    return esc_html__( 'Product Feedback', 'elementor' );
  }

  /**
   * @since 2.3.0
   * @access protected
   */
  protected function get_slug() {
    return 'product-feedback';
  }

  protected function get_base_connect_info() {
		return [
			'app' => 'editor',
			'access_token' => $this->get( 'access_token' ),
			'client_id' => $this->get( 'client_id' ),
      'endpoint' => 'taxonomies',
			'local_id' => get_current_user_id(),
			'site_key' => $this->get_site_key(),
			'home_url' => trailingslashit( home_url() ),
		];
	}

  protected function get_api_url() {
		return static::FEEDBACK_ENDPOINT . '/' . $this->get_slug();
	}

  protected function get_generated_urls($endpoint)
  {
    return [ $this->get_api_url() ];
  }

  public function submit($body) {
    $connect_info = $this->get_base_connect_info();
    $signature = $this->generate_signature($connect_info);
    $response = wp_remote_post( $this->get_api_url(), [
      'headers' => [
        'access-token' => $connect_info['access_token'],
        'app' => 'library',
        'client-id' => $connect_info['client_id'],
        'endpoint' => 'taxonomies',
        'home-url' => $connect_info['home_url'],
        'local-id' => $connect_info['local_id'],
        'site-key' => $this->get_site_key(),
        'X-Elementor-Signature' => $signature,
      ],
      'body' => $body,
    ]);
    return $response;
  }
}