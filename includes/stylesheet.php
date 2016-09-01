<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Stylesheet {

	private $rules = [];

	private $devices = [];

	public function add_device( $device_name, $device_max_point ) {
		$this->devices[ $device_name ] = $device_max_point;
	}

	public function add_rules( $selector, $rules, $device = 'desktop' ) {
		if ( ! isset( $this->rules[ $device ][ $selector ] ) ) {
			$this->rules[ $device ][ $selector ] = [];
		}

		$this->rules[ $device ][ $selector ] = array_merge( $this->rules[ $device ][ $selector ], $rules );
	}

	public function parse_rules( $rules ) {
		$parsed_rules = '';

		foreach ( $rules as $selector => $properties ) {
			$selector_content = $this->parse_properties( $properties );

			if ( $selector_content ) {
				$parsed_rules .= $selector . '{' . $selector_content . '}';
			}
		}

		return $parsed_rules;
	}

	public function parse_properties( $properties ) {
		$parsed_properties = '';

		foreach ( $properties as $property_key => $property_value ) {
			if ( $property_value ) {
				$parsed_properties .= $property_key . ':' . $property_value . ';';
			}
		}

		return $parsed_properties;
	}

	public function __toString() {
		$style_text = '';

		foreach ( $this->rules as $device_name => $rules ) {
			$device_text = $this->parse_rules( $rules );

			if ( $device_text && isset( $this->devices[ $device_name ] ) ) {
				$device_text = '@media(max-width: ' . $this->devices[ $device_name ] . 'px){' . $device_text . '}';
			}

			$style_text .= $device_text;
		}

		return $style_text;
	}
}
