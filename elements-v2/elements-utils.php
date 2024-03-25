<?php

namespace Elementor\ElementsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elements_Utils {
	public static function create_element( $tag, $attrs, $children = [] ) {
		$attrs = array_filter( $attrs );

		$string_attrs = '';

		foreach ( $attrs as $key => $item ) {
			$string_attrs .= sprintf( ' %1$s="%2$s"', $key, $item );
		}

		return sprintf( '<%1$s %2$s>%3$s</%1$s>', $tag, $string_attrs, implode( '', $children ) );
	}

	public static function classes( $list ) {
		return implode( ' ', array_filter( $list ) );
	}
}
