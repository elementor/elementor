<?php

namespace Elementor\Testing\Modules\Components\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Nested_Components_Mocks {
	static array $button_component_data;

	static array $card_component_data;

	static array $card_accordion_component_data;

	/**
	 * Get mock data for button component (id 1111)
	 *
	 * @return array
	 */
	public static function get_button_component_data(): array {
		if ( ! isset( self::$button_component_data ) ) {
			$elements_json_content = file_get_contents( __DIR__ . '/button-component-elements.json' );
			$overridable_props_json_content = file_get_contents( __DIR__ . '/button-component-overridable-props.json' );

			self::$button_component_data = [
				'elements' => json_decode( $elements_json_content, true ),
				'overridable_props' => json_decode( $overridable_props_json_content, true ),
			];
		}

		return self::$button_component_data;
	}

	/**
	 * Get mock data for card component (id 2222)
	 *
	 * @return array
	 */
	public static function get_card_component_data(): array {
		if ( ! isset( self::$card_component_data ) ) {
			$elements_json_content = file_get_contents( __DIR__ . '/card-component-elements.json' );
			$overridable_props_json_content = file_get_contents( __DIR__ . '/card-component-overridable-props.json' );

			self::$card_component_data = [
				'elements' => json_decode( $elements_json_content, true ),
				'overridable_props' => json_decode( $overridable_props_json_content, true ),
			];
		}

		return self::$card_component_data;
	}

	/**
	 * Get mock data for card accordion component (id 3333)
	 *
	 * @return array
	 */
	public static function get_card_accordion_component_data(): array {
		if ( ! isset( self::$card_accordion_component_data ) ) {
			$json_content = file_get_contents( __DIR__ . '/card-accordion-component-elements.json' );
			$overridable_props_json_content = file_get_contents( __DIR__ . '/card-accordion-component-overridable-props.json' );

			self::$card_accordion_component_data = [
				'elements' => json_decode( $json_content, true ),
				'overridable_props' => json_decode( $overridable_props_json_content, true ),
			];
		}

		return self::$card_accordion_component_data;
	}
}
