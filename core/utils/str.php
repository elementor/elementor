<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Str {

	/**
	 * Convert a non-latin URL to an IDN one.
	 * Note: Max length is 64 chars.
	 *
	 * @param string $url - A URL to encode.
	 *
	 * @return string - IDN encoded URL ( e.g. `http://é.com` will be encoded to `http://xn--9ca.com` ).
	 */
	public static function encode_idn_url( $url ) {
		return preg_replace_callback( '/(https?:\/\/)(.+)/', function ( $matches ) {
			return $matches[1] . \Requests_IDNAEncoder::encode( $matches[2] );
		}, $url );
	}

	/**
	 * Format a string from camelCase or snake_case to Title case.
	 *
	 * @param $string
	 *
	 * @return string
	 */
	public final static function to_title_case( $string ) {
		return ucfirst( strtolower( trim( join( ' ', preg_split( '/(?<!_)(?=[A-Z])|_/', $string ) ) ) ) );
	}
}
