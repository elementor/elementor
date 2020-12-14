<?php
namespace Elementor\Core\Editor\Data\Globals;

use Elementor\Data\Base\Controller as Controller_Base;
use Elementor\Plugin;

class Controller extends Controller_Base {
	public function get_name() {
		return 'globals';
	}

	public function register_endpoints() {
		$this->register_endpoint( Endpoints\Colors::class );
		$this->register_endpoint( Endpoints\Typography::class );
	}

	protected function register_internal_endpoints() {
		$this->register_endpoint( Endpoints\Index::class );
	}

	public function get_permission_callback( $request ) {
		// Allow internal get global values. (e.g render global.css for a visitor)
		if ( 'GET' === $request->get_method() && Plugin::$instance->data_manager->is_internal() ) {
			return true;
		}

		return current_user_can( 'edit_posts' );
	}
}
