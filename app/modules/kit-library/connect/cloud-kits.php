<?php
namespace Elementor\App\Modules\KitLibrary\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cloud_Kits extends Library {

	public function get_title() {
		return esc_html__( 'Cloud Kits', 'elementor' );
	}

	protected function get_api_url(): string {
		return 'https://cloud-library.prod.builder.elementor.red/api/v1/cloud-library';
	}

	/**
	 * @return array|\WP_Error
	 */
	public function get_all( $args = [] ) {
		return $this->http_request( 'GET', 'kits', [], [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	/**
	 * @return array|\WP_Error
	 */
	public function get_quota() {
		return $this->http_request( 'GET', 'quota/kits', [], [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	protected function init() {}
}
