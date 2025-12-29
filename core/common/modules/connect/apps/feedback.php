<?php

namespace Elementor\Core\Common\Modules\Connect\Apps;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Feedback extends Common_App {

	const EXPERIMENT_NAME = 'in_editor_feedback';

	const FEEDBACK_ENDPOINT = 'https://my.elementor.com/feedback/api/v1';

	public function __construct() {
		parent::__construct();
		Plugin::$instance->experiments->add_feature([
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'In-Editor Feedback', 'elementor' ),
			'description' => esc_html__( 'Enable in-editor feedback submission.', 'elementor' ),
			'hidden' => true,
			'release_status' => Plugin::$instance->experiments::RELEASE_STATUS_BETA,
			'default' => Plugin::$instance->experiments::STATE_INACTIVE,
			'new_site' => [
				'default_active' => false,
				'minimum_installation_version' => '3.35.0',
			],
		]);
	}

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

	protected function get_generated_urls( $endpoint ) {
		return [ $this->get_api_url() ];
	}

	public function submit( $body ) {
		$is_active = Plugin::instance()->experiments->is_feature_active( self::EXPERIMENT_NAME );
		if ( ! $is_active ) {
			return [
				'success' => false,
				'data' => [
					'message' => 'In-Editor Feedback is not active.',
				],
			];
		}
		$connect_info = $this->get_base_connect_info();
		$merged_body = array_merge( $connect_info, $body );
		$signature = $this->generate_signature( $merged_body );
		$headers = [
			'access-token' => $connect_info['access_token'],
			'app' => 'library',
			'client-id' => $connect_info['client_id'],
			'endpoint' => 'taxonomies',
			'home-url' => $connect_info['home_url'],
			'local-id' => $connect_info['local_id'],
			'site-key' => $this->get_site_key(),
			'X-Elementor-Signature' => $signature,
		];
		$response = wp_remote_post( $this->get_api_url(), [
			'headers' => $headers,
			'body' => $body,
		]);
		return $response;
	}
}
