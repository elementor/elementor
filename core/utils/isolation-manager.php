<?php

namespace Elementor\Core\Utils;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Isolation_Manager{
	/**
	 * @param string $adapter_name
	 *
	 * @return mixed
	 */
	public static function get_adapter( string $adapter_name ): mixed {
		$container = PLugin::$instance->elementor_container();
		return $container->get( $adapter_name );
	}
}
