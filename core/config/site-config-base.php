<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Site_Config_Base extends WP_Option_Base {
	const PREFIX = 'elementor_';

	/**
	 * @return bool
	 */
	public static function should_autoload() {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	final protected static function setter( $value ): bool {
		return update_option( static::get_full_key(), $value, static::should_autoload() );
	}
}
