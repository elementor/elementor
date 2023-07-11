<?php

namespace Elementor\Modules\SiteNavigation\Data;

use Elementor\Data\V2\Base\Controller as Base_Controller;
use Elementor\Modules\SiteNavigation\Data\Endpoints\Recent_Posts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {

	public function get_name() {
		return 'site-navigation';
	}

	public function get_items_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	public function get_item_permissions_check( $request ) {
		return $this->get_items_permissions_check( $request );
	}

	public function register_endpoints() {
		$this->register_endpoint( new Recent_Posts( $this ) );
	}

	protected function register_index_endpoint() {
		// Bypass, currently does not required.
	}
}
