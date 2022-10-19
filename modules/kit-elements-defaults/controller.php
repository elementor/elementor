<?php
namespace Elementor\Modules\KitElementsDefaults;

use Elementor\Modules\KitElementsDefaults\Utils\Settings_Sanitizer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller {

	const NAMESPACE = 'elementor/v1';

	const BASE_URL = '/kit-elements-defaults';

	public function register() {
		add_action( 'rest_api_init', function () {
			$this->register_routes();
		} );
	}

	private function register_routes() {
		register_rest_route( static::NAMESPACE, static::BASE_URL, [
			[
				'methods' => 'GET',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'callback' => $this->wrap_callback( function () {
					return $this->index();
				} ),
			],
		] );

		register_rest_route( static::NAMESPACE, static::BASE_URL . '/(?P<type>[\w\-_]+)', [
			[
				'methods' => 'PUT',
				'args' => [
					'type' => [
						'type' => 'string',
						'description' => 'The type of the element.',
						'required' => true,
						'validate_callback' => function( $type ) {
							return $this->validate_type( $type );
						},
					],
					'settings' => [
						'description' => 'All the default values for the requested type',
						'required' => true,
						'type' => 'object',
						'validate_callback' => function( $settings ) {
							return is_array( $settings );
						},
						'sanitize_callback' => function( $settings, \WP_REST_Request $request ) {
							return $this
								->make_settings_sanitizer()
								->sanitize( $settings, $request->get_param( 'type' ) );
						},
					],
				],
				'callback' => $this->wrap_callback( function ( \WP_REST_Request $request ) {
					return $this->update( $request );
				} ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			],
		] );

		register_rest_route( static::NAMESPACE, static::BASE_URL . '/(?P<type>[\w\-_]+)', [
			[
				'methods' => 'DELETE',
				'args' => [
					'type' => [
						'type' => 'string',
						'description' => 'The type of the element.',
						'required' => true,
						'validate_callback' => function( $type ) {
							return $this->validate_type( $type );
						},
					],
				],
				'callback' => $this->wrap_callback( function ( \WP_REST_Request $request ) {
					return $this->destroy( $request );
				} ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			],
		] );
	}

	private function index() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return new \WP_REST_Response( $kit->get_json_meta( Module::META_KEY ) );
	}

	private function update( \WP_REST_Request $request ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$data = $kit->get_json_meta( Module::META_KEY );

		$data[ $request->get_param( 'type' ) ] = $request->get_param( 'settings' );

		$kit->update_meta(
			Module::META_KEY,
			// `wp_slash` in order to avoid the unslashing during the `update_post_meta`
			wp_slash( wp_json_encode( $data ) )
		);

		return new \WP_REST_Response( [], 201 );
	}

	private function destroy( \WP_REST_Request $request ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$data = $kit->get_json_meta( Module::META_KEY );

		unset( $data[ $request->get_param( 'type' ) ] );

		$kit->update_meta(
			Module::META_KEY,
			// `wp_slash` in order to avoid the unslashing during the `update_post_meta`
			wp_slash( wp_json_encode( $data ) )
		);

		return new \WP_REST_Response( [], 204 );
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
			$is_valid_kit = $kit && $kit->get_main_id();

			if ( ! $is_valid_kit ) {
				return new \WP_Error( 'invalid_kit', 'Kit doesn\'t exist.', [
					'status' => 404,
				] );
			}

			return $callback( $request );
		};
	}

	private function validate_type( $param ) {
		$element_types = array_keys( Plugin::$instance->elements_manager->get_element_types() );
		$widget_types  = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

		return in_array(
			$param,
			array_merge( $element_types, $widget_types ),
			true
		);
	}

	private function make_settings_sanitizer() {
		$elements_manager = Plugin::$instance->elements_manager;
		$widget_types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

		return new Settings_Sanitizer( $elements_manager, $widget_types );
	}
}
