<?php

namespace Elementor\Modules\EditorUser;

use Elementor\User;

class Editor_User_Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'editor-user';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_rest_routes() );
	}

	private function register_rest_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn() => $this->route_wrapper( fn() => $this->get_user_data() ),
				'permission_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'PATCH',
				'callback' => fn( \WP_REST_Request $request ) => $this->route_wrapper( fn() => $this->update_user_data( $request ) ),
				'permission_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
				'args' => [
					'introductions' => [
						'required' => true,
						'type' => 'object',
					],
				],
			],
		] );
	}

	private function get_user_data() {
		$data = [
			'introductions' => get_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, true ),
		];

		return new \WP_REST_Response( [ 'data' => $data ] );
	}

	private function update_user_data( \WP_REST_Request $request ) {
		$data = $request->get_params();

		$sanitized_data = $this->sanitize_user_data( $data );

		if ( $sanitized_data['introductions'] ) {
			$user_introductions = User::get_introduction_meta();
			$sanitized_data['introductions'] = array_merge( $sanitized_data['introductions'], $user_introductions );
			update_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, $sanitized_data['introductions'] );
		}

		return new \WP_REST_Response( [ 'data' => $sanitized_data ] );
	}

	private function sanitize_user_data( $data ) {
		if ( ! is_array( $data ) ) {
			return [];
		}

		$sanitized_data = [];

		$sanitized_data['introductions'] = $this->sanitize_introductions( $data['introductions'] );

		return $sanitized_data;
	}

	private function sanitize_introductions( $introductions ) {
		if ( ! is_array( $introductions ) ) {
			return [];
		}

		return array_filter( $introductions, function( $introduction ) {
			return is_bool( $introduction );
		} );
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Something went wrong', [ 'status' => 500 ] );
		}

		return $response;
	}
}
