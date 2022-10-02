<?php
namespace Elementor\Modules\KitElementsDefaults\Data;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller {

	const META_KEY = '_elementor_elements_defaults_values';

	/**
	 * GET '/kit-elements-defaults'
	 */
	public function index() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return new \WP_REST_Response( $kit->get_json_meta( static::META_KEY ) );
	}

	/**
	 * PUT '/kit-elements-defaults/{type}'
	 */
	public function store( \WP_REST_Request $request ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$element = $this->get_element_instance( $request->get_param( 'type' ) );

		if ( ! $element ) {
			return new \WP_Error( 'invalid_element', 'Element doesn\'t exist.', [
				'status' => 404,
			] );
		}

		$valid_element_controls = $element->get_controls();

		// Remove the controls that don't exist in the element.
		$sanitized_settings = array_intersect_key(
			$request->get_param( 'settings' ),
			$valid_element_controls
		);

		$data = $kit->get_json_meta( static::META_KEY );

		$data[ $request->get_param( 'type' ) ] = $sanitized_settings;

		$kit->update_meta(
			static::META_KEY,
			wp_json_encode( $data )
		);

		return new \WP_REST_Response( [], 201 );
	}

	/**
	 * DELETE '/kit-elements-defaults/{type}'
	 */
	public function destroy( \WP_REST_Request $request ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$data = $kit->get_json_meta( static::META_KEY );

		unset( $data[ $request->get_param( 'type' ) ] );

		$kit->update_meta(
			static::META_KEY,
			wp_json_encode( $data )
		);

		return new \WP_REST_Response( [], 204 );
	}

	private function is_element( $type ) {
		$element_types = array_keys( Plugin::$instance->elements_manager->get_element_types() );

		return in_array( $type, $element_types, true );
	}

	private function get_element_instance( $type ) {
		$args = $this->is_element( $type )
			? [
				'elType' => $type,
				'id' => '0',
			]
			: [
				'elType' => 'widget',
				'widgetType' => $type,
				'id' => '0',
			];

		return Plugin::$instance->elements_manager->create_element_instance( $args );
	}
}
