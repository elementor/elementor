<?php
namespace Elementor\Modules\KitElementsDefaults;

use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Utils {

	/**
	 * Wrapper to validate that the kit is valid.
	 * Essentially behaves as a middleware.
	 *
	 * @param $callback
	 *
	 * @return \Closure
	 */
	public static function wrap_callback( $callback ) {
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

	public static function validate_type( $param ) {
		$element_types = array_keys( Plugin::$instance->elements_manager->get_element_types() );
		$widget_types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

		return in_array(
			$param,
			array_merge( $element_types, $widget_types ),
			true
		);
	}

	public static function sanitize_settings( $param, \WP_REST_Request $request ) {
		$element = static::get_element_instance( $request->get_param( 'type' ) );

		if ( ! $element ) {
			return [];
		}

		$sanitized_settings = static::remove_invalid_settings( $element, $param );
		$sanitized_settings = static::remove_secret_settings( $element, $sanitized_settings );

		return $sanitized_settings;
	}

	private static function remove_invalid_settings( Element_Base $element, $settings ) {
		$valid_element_controls = $element->get_controls();

		// Remove the controls that don't exist in the element.
		return array_intersect_key(
			$settings,
			$valid_element_controls
		);
	}

	private static function remove_secret_settings( Element_Base $element, $settings ) {
		// We rely on the `on_export` method that should remove secrets from the settings.
		if ( method_exists( $element, 'on_export' ) ) {
			$element_data = $element->get_data();
			$element_data['settings'] = $settings;

			$element_data = $element->on_export( $element_data );

			$settings = $element_data['settings'] ?? [];
		}

		return $settings;
	}

	private static function is_widget( $type ) {
		$widget_types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

		return in_array( $type, $widget_types, true );
	}

	private static function get_element_instance( $type ) {
		$args = static::is_widget( $type )
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
