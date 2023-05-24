<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Site_Config_Base extends WP_Option_Base {

	const DB_KEY_PREFIX = 'elementor_';

	public static function get_db_key(): string {
		return static::DB_KEY_PREFIX . static::get_key();
	}

	/**
	 * @return bool
	 */
	abstract public static function should_autoload(): bool;

	final protected static function setter( $value ): bool {
		return update_option( static::get_db_key(), $value, static::should_autoload() );
	}
}
