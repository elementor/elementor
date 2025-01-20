<?php
namespace Elementor\Modules\CloudLibrary\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cloud_Library extends Library {
	const API_URL = 'https://my.elementor.com/api/v1';

	public function get_title(): string {
		return esc_html__( 'Cloud Library', 'elementor' );
	}

	protected function get_slug(): string {
		return 'cloud-library';
	}

	public function get_resources() {
		return $this->http_request( 'GET', 'resources' );
	}

	protected function init() {}
}
