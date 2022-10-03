<?php
namespace Elementor\Modules\KitElementsDefaults;

use Elementor\Element_Base;
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
				'callback' => $this->wrap_callback( function () {
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
							return $this->validate_type( $param );
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
							return $this->sanitize_settings( $param, $request );
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
							return $this->validate_type( $param );
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

	private function validate_type( $param ) {
		$element_types = array_keys( Plugin::$instance->elements_manager->get_element_types() );
		$widget_types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

		return in_array(
			$param,
			array_merge( $element_types, $widget_types ),
			true
		);
	}

	private function sanitize_settings( $param, \WP_REST_Request $request ) {
		$element = $this->get_element_instance( $request->get_param( 'type' ) );

		if ( ! $element ) {
			return [];
		}

		$sanitized_settings = $this->remove_invalid_settings( $element, $param );
		$sanitized_settings = $this->remove_secret_settings( $element, $sanitized_settings );

		return $sanitized_settings;
	}

	private function remove_invalid_settings( Element_Base $element, $settings ) {
		$valid_element_controls = $element->get_controls();

		// Remove the controls that don't exist in the element.
		return array_intersect_key(
			$settings,
			$valid_element_controls
		);
	}

	private function remove_secret_settings( Element_Base $element, $settings ) {
		// We rely on the `on_export` method that should remove secrets from the settings.
		if ( method_exists( $element, 'on_export' ) ) {
			$element_data = $element->get_data();
			$element_data['settings'] = $settings;

			$element_data = $element->on_export( $element_data );

			$settings = $element_data['settings'] ?? [];
		}

		return $settings;
	}

	private function is_widget( $type ) {
		$widget_types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

		return in_array( $type, $widget_types, true );
	}

	private function get_element_instance( $type ) {
		$args = $this->is_widget( $type )
			? [
				'elType' => 'widget',
				'widgetType' => $type,
				'id' => '0',
			] : [
				'elType' => $type,
				'id' => '0',
			];

		return Plugin::$instance->elements_manager->create_element_instance( $args );
	}
}
