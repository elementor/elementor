<?php
namespace Elementor\Core\Editor\Data\Globals;

use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;

class Controller extends Controller_Base {
	public function get_name() {
		return 'globals';
	}

	public function register_endpoints() {
		$this->register_endpoint( new Endpoints\Colors( $this ) );
		$this->register_endpoint( new Endpoints\Typography( $this ) );
	}

	public function get_collection_params() {
		// Does not have 'get_items' args (OPTIONS).
		// Maybe TODO: try `$this->get_index_endpoint()->get_collection_params()`.
		return [];
	}

	public function get_permission_callback( $request ) {
		$method_type = $request->get_method();
		if ( \WP_REST_Server::READABLE === $method_type ) {
			// Allow internal get global values. (e.g render global.css for a visitor)
			if ( Plugin::$instance->data_manager_v2->is_internal() ) {
				return true;
			}

			return current_user_can( 'edit_posts' );
		}

		if ( \WP_REST_Server::CREATABLE === $method_type || \WP_REST_Server::DELETABLE === $method_type ) {
			return current_user_can( 'manage_options' );
		}

		return false;
	}

	protected function register_index_endpoint() {
		$this->register_endpoint( new Endpoint\Index\AllChildren( $this ) );
	}
}
