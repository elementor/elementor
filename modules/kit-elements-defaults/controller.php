<?php
namespace Elementor\Modules\KitElementsDefaults;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller {

	const NAMESPACE = 'elementor/v1';

	const BASE_URL = '/kit-elements-defaults';

	const META_KEY = '_elementor_elements_defaults_values';

	public function register() {
		add_action( 'rest_api_init', function () {
			$this->register_index();

			$this->register_update();

			$this->register_destroy();
		} );
	}


	/**
	 * GET '/kit-elements-defaults'
	 */
	private function register_index() {
		register_rest_route( static::NAMESPACE, static::BASE_URL, [
			[
				'methods' => 'GET',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'callback' => Utils::wrap_callback( function () {
					return $this->index();
				} ),
			],
		] );
	}

	private function index() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return new \WP_REST_Response( $kit->get_json_meta( static::META_KEY ) );
	}


	/**
	 * PUT '/kit-elements-defaults/{type}'
	 */
	private function register_update() {
		register_rest_route( static::NAMESPACE, static::BASE_URL . '/(?P<type>[\w\-_]+)', [
			[
				'methods' => 'PUT',
				'args' => [
					'type' => [
						'type' => 'string',
						'description' => 'The type of the element.',
						'required' => true,
						'validate_callback' => function( $param ) {
							return Utils::validate_type( $param );
						},
					],
					'settings' => [
						'description' => 'All the default values for the requested type',
						'required' => true,
						'type' => 'object',
						'validate_callback' => function( $param ) {
							return is_array( $param );
						},
						'sanitize_callback' => function( $param, \WP_REST_Request $request ) {
							return Utils::sanitize_settings( $param, $request );
						},
					],
				],
				'callback' => Utils::wrap_callback( function ( \WP_REST_Request $request ) {
					return $this->update( $request );
				} ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			],
		] );
	}

	private function update( \WP_REST_Request $request ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$data = $kit->get_json_meta( static::META_KEY );

		$data[ $request->get_param( 'type' ) ] = $request->get_param( 'settings' );

		$kit->update_meta(
			static::META_KEY,
			wp_json_encode( $data )
		);

		return new \WP_REST_Response( [], 201 );
	}


	/**
	 * DELETE '/kit-elements-defaults/{type}'
	 */
	private function register_destroy() {
		register_rest_route( static::NAMESPACE, static::BASE_URL . '/(?P<type>[\w\-_]+)', [
			[
				'methods' => 'DELETE',
				'args' => [
					'type' => [
						'type' => 'string',
						'description' => 'The type of the element.',
						'required' => true,
						'validate_callback' => function( $param ) {
							return Utils::validate_type( $param );
						},
					],
				],
				'callback' => Utils::wrap_callback( function ( \WP_REST_Request $request ) {
					return $this->destroy( $request );
				} ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			],
		] );
	}

	private function destroy( \WP_REST_Request $request ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$data = $kit->get_json_meta( static::META_KEY );

		unset( $data[ $request->get_param( 'type' ) ] );

		$kit->update_meta(
			static::META_KEY,
			wp_json_encode( $data )
		);

		return new \WP_REST_Response( [], 204 );
	}
}
