<?php

namespace Elementor\Modules\SiteNavigation\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Add_New_Post extends Endpoint {

	public function register_items_route( $methods = WP_REST_Server::CREATABLE, $args = [] ) {
		$args = [
			'post_type' => [
				'description' => 'Post type to create',
				'type' => 'string',
				'required' => false,
				'default' => 'post',
				'sanitize_callback' => function ( $value ) {
					return wp_strip_all_tags( $value, true );
				},
				'validate_callback' => 'rest_validate_request_arg',
			],
		];

		parent::register_items_route( $methods, $args );
	}

	public function get_name() {
		return 'add-new-post';
	}

	public function get_format() {
		return 'site-navigation/add-new-post';
	}

	public function create_items( $request ) {
		$document = Plugin::$instance->documents->create( $request->get_param( 'post_type' ) );
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
