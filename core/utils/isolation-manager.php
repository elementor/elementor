<?php

namespace Elementor\Core\Utils;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Isolation_Manager {
	/**
	 * @param string $adapter_name
	 */
	public static function get_adapter( string $adapter_name ) {
		try {
			return PLugin::$instance->elementor_container()
				->get( $adapter_name );
		} catch ( Exception $e ) {
			return null;
		}
	}
}
