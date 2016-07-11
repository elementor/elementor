<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Control_Base_Multiple extends Control_Base {

	public function get_default_value() {
		return [];
	}

	public function get_value( $control, $instance ) {
		$value = parent::get_value( $control, $instance );

		if ( empty( $control['default'] ) )
			$control['default'] = [];

		if ( ! is_array( $value ) )
			$value = [];

		$control['default'] = array_merge(
			$this->get_default_value(),
			$control['default']
		);

		return array_merge(
			$control['default'],
			$value
		);
	}

	public function get_replace_style_values( $css_property, $control_value ) {
		if ( ! is_array( $control_value ) ) {
			return '';
		}

		// Trying to retrieve whole the related properties
		// according to the string matches.
		// When one of the properties is empty, aborting
		// the action and returning an empty string.
		try {
			return preg_replace_callback( '/\{\{([A-Z]+)}}/', function( $matches ) use ( $control_value ) {
				$value = $control_value[ strtolower( $matches[1] ) ];

				if ( '' === $value ) {
					throw new \Exception();
				}

				return $value;
			}, $css_property );
		} catch ( \Exception $e ) {
			return '';
		}
	}
}
