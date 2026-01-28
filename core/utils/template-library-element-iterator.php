<?php

namespace Elementor\Core\Utils;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Element_Iterator {
	public static function iterate( array $elements, callable $callback ): array {
		return Plugin::$instance->db->iterate_data( $elements, $callback );
	}
}
