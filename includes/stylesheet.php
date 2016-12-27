<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Stylesheet {

	private $rules = [];
	private $devices = [];
	private $raw = [];

	/**
	 * @param array $rules
	 *
	 * @return string
	 */
	public static function parse_rules( array $rules ) {
		$parsed_rules = '';

		foreach ( $rules as $selector => $properties ) {
			$selector_content = self::parse_properties( $properties );

			if ( $selector_content ) {
				$parsed_rules .= $selector . '{' . $selector_content . '}';
			}
		}

		return $parsed_rules;
	}

	/**
	 * @param array $properties
	 *
	 * @return string
	 */
	public static function parse_properties( array $properties ) {
		$parsed_properties = '';

		foreach ( $properties as $property_key => $property_value ) {
			if ( '' !== $property_value ) {
				$parsed_properties .= $property_key . ':' . $property_value . ';';
			}
		}

		return $parsed_properties;
	}

	/**
	 * @param string $device_name
	 * @param string $device_max_point
	 *
	 * @return $this
	 */
	public function add_device( $device_name, $device_max_point ) {
		$this->devices[ $device_name ] = $device_max_point;

		return $this;
	}

	/**
	 * @param string $selector
	 * @param array|string $rules
	 * @param string $device
	 *
	 * @return $this
	 */
	public function add_rules( $selector, $rules = null, $device = 'desktop' ) {
		if ( null === $rules ) {
			preg_match_all( '/([^\s].+?(?=\{))\{((?s:.)+?(?=}))}/', $selector, $parsed_rules );

			foreach ( $parsed_rules[1] as $index => $selector ) {
				$this->add_rules( $selector, $parsed_rules[2][ $index ], $device );
			}

			return $this;
		}

		if ( ! isset( $this->rules[ $device ][ $selector ] ) ) {
			$this->rules[ $device ][ $selector ] = [];
		}

		if ( is_string( $rules ) ) {
			$rules = array_filter( explode( ';', trim( $rules ) ) );

			$ordered_rules = [];

			foreach ( $rules as $rule ) {
				$property = explode( ':', $rule, 2 );

				$ordered_rules[ trim( $property[0] ) ] = trim( $property[1], ' ;' );
			}

			$rules = $ordered_rules;
		}

		$this->rules[ $device ][ $selector ] = array_merge( $this->rules[ $device ][ $selector ], $rules );

		return $this;
	}

	public function add_raw_css( $css, $device = '' ) {
		if ( ! isset( $this->raw[ $device ] ) ) {
			$this->raw[ $device ] = [];
		}

		$this->raw[ $device ][] = trim( $css );

		return $this;
	}

	public function get_rules( $device = null, $selector = null, $property = null ) {
		if ( ! $device ) {
			return $this->rules;
		}

		if ( $property ) {
			return isset( $this->rules[ $device ][ $selector ][ $property ] ) ? $this->rules[ $device ][ $selector ][ $property ] : null;
		}

		if ( $selector ) {
			return isset( $this->rules[ $device ][ $selector ] ) ? $this->rules[ $device ][ $selector ] : null;
		}

		return isset( $this->rules[ $device ] ) ? $this->rules[ $device ] : null;
	}

	public function __toString() {
		$style_text = '';

		foreach ( $this->rules as $device_name => $rules ) {
			$device_text = self::parse_rules( $rules );

			if ( $device_text && isset( $this->devices[ $device_name ] ) ) {
				$device_text = '@media(max-width: ' . $this->devices[ $device_name ] . 'px){' . $device_text . '}';
			}

			$style_text .= $device_text;
		}

		foreach ( $this->raw as $device_name => $raw ) {
			$raw = implode( "\n", $raw );

			if ( $raw && isset( $this->devices[ $device_name ] ) ) {
				$raw = '@media(max-width: ' . $this->devices[ $device_name ] . 'px){' . $raw . '}';
			}

			$style_text .= $raw;
		}

		return $style_text;
	}
}
