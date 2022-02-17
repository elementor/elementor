<?php

namespace Elementor\Core\Common\Modules\Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Common\Modules\Connect\Endpoints\Test;
use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Plugin;

class Controller extends Controller_Base {

	public function get_name() {
		return 'connect';
	}

	public function register_endpoints() {
		$this->index_endpoint->register_sub_endpoint( new Test( $this ) );
	}

	public function get_permission_callback( $request ) {
		//return current_user_can( 'administrator' );
		return true;
	}
}
