<?php

namespace Elementor\Modules\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Utils {
	public static function is_tuple( $val ) {
		return is_array( $val ) && 2 === count( $val );
	}
}
