<?php
namespace Elementor\Modules\KitElementsDefaults\Data;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Routes {

	const NAMESPACE = 'elementor/v1';

	const BASE_URL = '/kit-elements-defaults';

	public function register() {
		add_action( 'rest_api_init', function () {
			$this->register_index();

			$this->register_store();

			$this->register_destroy();
		} );
	}

	private function register_index() {
		register_rest_route( static::NAMESPACE, static::BASE_URL, [
			[
				'methods' => 'GET',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'callback' => $this->wrap_callback( function () {
					return ( new Controller() )->index();
				} ),
			],
		] );
	}

	private function register_store() {
		register_rest_route( static::NAMESPACE, static::BASE_URL . '/(?P<type>[\w\-_]+)', [
			[
				'methods' => 'PUT',
				'args' => [
					'type' => [
						'type' => 'string',
						'description' => 'The type of the element.',
						'required' => true,
						'validate_callback' => function( $param ) {
							return $this->validate_type( $param );
						},
					],
					'settings' => [
						'description' => 'All the default values for the requested type',
						'required' => true,
						'type' => 'object',
					],
				],
				'callback' => $this->wrap_callback( function ( \WP_REST_Request $request ) {
					return ( new Controller() )->store( $request );
				} ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			],
		] );
	}


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
							return $this->validate_type( $param );
						},
					],
				],
				'callback' => $this->wrap_callback( function ( \WP_REST_Request $request ) {
					return ( new Controller() )->destroy( $request );
				} ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			],
		] );
	}

	private function validate_type( $param ) {
		$element_types = array_keys( Plugin::$instance->elements_manager->get_element_types() );
		$widget_types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

		return in_array(
			$param,
			array_merge( $element_types, $widget_types ),
			true
		);
	}

	/**
	 * Wrapper to validate that the kit is valid.
	 * Essentially behaves as a middleware.
	 *
	 * @param $callback
	 *
	 * @return \Closure
	 */
	private function wrap_callback( $callback ) {
		return function ( \WP_REST_Request $request ) use ( $callback ) {
			$kit = Plugin::$instance->kits_manager->get_active_kit();

			// TODO: Is this right?
			$is_valid_kit = $kit && $kit->get_main_id();

			if ( ! $is_valid_kit ) {
				return new \WP_Error( 'invalid_kit', 'Kit doesn\'t exist.', [
					'status' => 404,
				] );
			}

			return $callback( $request );
		};
	}
}
