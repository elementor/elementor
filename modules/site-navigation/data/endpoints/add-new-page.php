<?php

namespace Elementor\Modules\SiteNavigation\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Add_New_Page extends Endpoint {

	public function register_items_route( $methods = WP_REST_Server::CREATABLE, $args = [] ) {
		parent::register_items_route( $methods, $args );
	}

	public function get_name() {
		return 'add-new-page';
	}

	public function get_format() {
		return 'site-navigation/add-new-page';
	}

	public function create_items( $request ) {
		$document = Plugin::$instance->documents->create( 'page' );

		if ( is_wp_error( $document ) ) {
			return [
				'id' => 0,
				'edit_url' => '',
			];
		}

		return [
			'id' => $document->get_main_id(),
			'edit_url' => $document->get_edit_url(),
		];
	}
}
