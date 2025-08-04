<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\Components\Documents\Component;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'components';

	private $repository = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function get_repository() {
		if ( ! $this->repository ) {
			$this->repository = new Components_Repository();
		}

		return $this->repository;
	}

	private function register_routes() {
		// GET /elementor/v1/components - List components
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get_components( $request ) ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			],
		] );

		// POST /elementor/v1/components - Create component
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->create_component( $request ) ),
				'permission_callback' => fn() => current_user_can( 'publish_posts' ),
				'args' => [
					'name' => [
						'type' => 'string',
						'required' => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
					'content' => [
						'type' => 'array',
						'required' => true,
					],
				],
			],
		] );
	}

	private function get_components( \WP_REST_Request $request ) {
		$components = $this->get_repository()->get_all();

		$response_data = array_map( function( $component ) {
			return [
				'component_id' => $component->get_id(),
				'title' => $component->get_post()->post_title,
			];
		}, $components );

		return rest_ensure_response( $response_data );
	}

	private function create_component( \WP_REST_Request $request ) {
		$name = $request->get_param( 'name' );
		$content = $request->get_param( 'content' );

		$component_id = $this->get_repository()->create( $name, $content );

		if ( is_wp_error( $component_id ) ) {
			return $component_id;
		}

		return rest_ensure_response( [
			'component_id' => $component_id,
		] );
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'unexpected_error',
				__( 'Something went wrong', 'elementor' ),
				[ 'status' => 500 ]
			);
		}

		return $response;
	}
}
