<?php

namespace Elementor\Testing\Modules\Components\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Nested_Components_Mocks {

	static array $button_component_data;

	/**
	 * Get mock data for button component (id 1111)
	 *
	 * @return array
	 */
	public static function get_button_component_data(): array {
		if ( ! isset( self::$button_component_data ) ) {
			$json_content = file_get_contents( __DIR__ . '/button-component-elements.json' );

			self::$button_component_data = json_decode( $json_content, true );
		}

		return self::$button_component_data;
	}
}
