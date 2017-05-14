<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Stylesheet {

	/**
	 * @var array
	 */
	private $rules = [];

	/**
	 * @var array
	 */
	private $devices = [];

	/**
	 * @var array
	 */
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

		asort( $this->devices );

		return $this;
	}

	/**
	 * @param string $selector
	 * @param array|string $style_rules
	 * @param array $query
	 *
	 * @return $this
	 */
	public function add_rules( $selector, $style_rules = null, array $query = null ) {
		$query_hash = 'all';

		if ( $query ) {
			$query_hash = $this->query_to_hash( $query );
		}

		if ( ! isset( $this->rules[ $query_hash ] ) ) {
			$this->add_query_hash( $query_hash );
		}

		if ( null === $style_rules ) {
			preg_match_all( '/([^\s].+?(?=\{))\{((?s:.)+?(?=}))}/', $selector, $parsed_rules );

			foreach ( $parsed_rules[1] as $index => $selector ) {
				$this->add_rules( $selector, $parsed_rules[2][ $index ], $query );
			}

			return $this;
		}

		if ( ! isset( $this->rules[ $query_hash ][ $selector ] ) ) {
			$this->rules[ $query_hash ][ $selector ] = [];
		}

		if ( is_string( $style_rules ) ) {
			$style_rules = array_filter( explode( ';', trim( $style_rules ) ) );

			$ordered_rules = [];

			foreach ( $style_rules as $rule ) {
				$property = explode( ':', $rule, 2 );

				if ( count( $property ) < 2 ) {
					return $this;
				}

				$ordered_rules[ trim( $property[0] ) ] = trim( $property[1], ' ;' );
			}

			$style_rules = $ordered_rules;
		}

		$this->rules[ $query_hash ][ $selector ] = array_merge( $this->rules[ $query_hash ][ $selector ], $style_rules );

		return $this;
	}

	/**
	 * @param string $css
	 * @param string $device
	 *
	 * @return $this
	 */
	public function add_raw_css( $css, $device = '' ) {
		if ( ! isset( $this->raw[ $device ] ) ) {
			$this->raw[ $device ] = [];
		}

		$this->raw[ $device ][] = trim( $css );

		return $this;
	}

	/**
	 * @param string $device
	 * @param string $selector
	 * @param string $property
	 *
	 * @return mixed
	 */
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

		foreach ( $this->rules as $query_hash => $rule ) {
			$device_text = self::parse_rules( $rule );

			if ( 'all' !== $query_hash ) {
				$device_text = $this->get_query_hash_style_format( $query_hash ) . '{' . $device_text . '}';
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

	/**
	 * @param string $device_name
	 *
	 * @return int
	 */
	private function get_device_max_value( $device_name ) {
		$devices_names = array_keys( $this->devices );

		$device_name_index = array_search( $device_name, $devices_names );

		$next_index = $device_name_index + 1;

		if ( $next_index >= count( $devices_names ) ) {
			throw new \RangeException( 'Max value for this device is out of range.' );
		}

		return $this->devices[ $devices_names[ $next_index ] ] - 1;
	}

	/**
	 * @param array $query
	 *
	 * @return string
	 */
	private function query_to_hash( array $query ) {
		$hash = [];

		foreach ( $query as $endpoint => $value ) {
			$hash[] = $endpoint . '_' . $value;
		}

		return implode( '-', $hash );
	}

	/**
	 * @param string $hash
	 *
	 * @return array
	 */
	private function hash_to_query( $hash ) {
		$query = [];

		$hash = array_filter( explode( '-', $hash ) );

		foreach ( $hash as $single_query ) {
			$query_parts = explode( '_', $single_query );

			$end_point = $query_parts[0];

			$device_name = $query_parts[1];

			$query[ $end_point ] = 'max' === $end_point ? $this->get_device_max_value( $device_name ) : $this->devices[ $device_name ];
		}

		return $query;
	}

	/**
	 * @param string $query_hash
	 */
	private function add_query_hash( $query_hash ) {
		$this->rules[ $query_hash ] = [];

		uksort( $this->rules, function( $a, $b ) {
			if ( 'all' === $a ) {
				return -1;
			}

			if ( 'all' === $b ) {
				return 1;
			}

			$a_query = $this->hash_to_query( $a );

			$b_query = $this->hash_to_query( $b );

			if ( isset( $a_query['min'] ) xor isset( $b_query['min'] ) ) {
				return 1;
			}

			if ( isset( $a_query['min'] ) ) {
				return $a_query['min'] - $b_query['min'];
			}

			return $b_query['max'] - $a_query['max'];
		} );
	}

	/**
	 * @param string $query_hash
	 *
	 * @return string
	 */
	private function get_query_hash_style_format( $query_hash ) {
		$query = $this->hash_to_query( $query_hash );

		$style_format = [];

		foreach ( $query as $end_point => $value ) {
			$style_format[] = '(' . $end_point . '-width:' . $value . 'px)';
		}

		return '@media' . implode( ' and ', $style_format );
	}
}
