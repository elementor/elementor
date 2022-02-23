<?php

namespace Elementor\Core\Common\Modules\Connect;

use Elementor\Data\V2\Base\Controller as Controller_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Controller_Base {

	public function get_name() {
		return 'connect';
	}

	public function register_endpoints() {
		$this->register_endpoint( new Endpoints\Health_Check( $this ) );
	}

	protected function register_index_endpoint() {
		// Bypass, currently not required.
	}

	public function get_permission_callback( $request ) {
		return current_user_can( 'edit_posts' );
	}
}
