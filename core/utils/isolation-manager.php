<?php

namespace Elementor\Core\Utils;

use Elementor\Core\Isolation\Wordpress_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Isolation_manager {
	/**
	 * @var Wordpress_Adapter
	 */
	private static $wordpress_adapter;

	/**
	 * @return Wordpress_Adapter
	 */
	public static function get_wordpress_adapter() {
		if ( ! self::$wordpress_adapter ) {
			self::$wordpress_adapter = new Wordpress_Adapter();
		}

		return self::$wordpress_adapter;
	}
}
