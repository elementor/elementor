<?php
namespace Elementor\Modules\Ai\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Ai extends Library {
	const API_URL = 'https://my.elementor.com/api/v2/ai/';

	public function get_title() {
		return esc_html__( 'AI', 'elementor' );
	}

	protected function get_api_url() {
		return static::API_URL . '/';
	}

	/**
	 * @param array $event_data {
	 *     @type string $name
	 *     @type array $data
	 *     @type array $client {
	 *         @type string $name
	 *         @type string $version
	 *         @type string $session_id
	 *     }
	 * }
	 */
	public function send_event( array $event_data ): void {
		$this->ai_request(
			'POST',
			'client-events/events',
			[
				'payload' => $event_data,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	private function ai_request( $method, $endpoint, $body ) {
		return $this->http_request(
			$method,
			$endpoint,
			[
				'timeout' => 100,
				'headers' => [
					'x-elementor-ai-version' => '2',
					'Content-Type' => 'application/json',
				],
				'body' => wp_json_encode( $body ),
			],
			[
				'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
				'with_error_data' => true,
			]
		);
	}

	protected function init() {}
}
