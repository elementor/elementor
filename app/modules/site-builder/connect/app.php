<?php
namespace Elementor\App\Modules\SiteBuilder\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class App extends Library {
	const API_URL = 'https://my.elementor.com/api/v2/builder/';

	public function get_title() {
		return esc_html__( 'Site Builder', 'elementor' );
	}

	protected function get_slug() {
		return 'site-builder';
	}

	protected function get_api_url() {
		return static::API_URL;
	}

	public function get_home_screen() {
		return $this->http_request(
			'GET',
			'website-planner/session/home-screen',
			[
				'headers' => [
					'x-host-site-title' => (string) get_bloginfo( 'name' ),
					'x-host-site-context' => (string) get_bloginfo( 'description' ),
				],
			],
			[
				'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
			]
		);
	}
}
