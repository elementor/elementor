<?php

namespace Elementor\Core\Common\Data\Global_Query;

use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Core\Common\Data\Global_Query\Endpoints\Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Controller_Base {
	public function get_name() {
		return 'global-query';
	}

	public function register_endpoints() {
//		$this->index_endpoint->register_item_route();
		$this->register_endpoint( new Post( $this ) );
	}

	public function get_item_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	public function get_items_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}
}
