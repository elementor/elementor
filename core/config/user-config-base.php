<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class User_Config_Base extends Config_Base {
	const DB_KEY_PREFIX = 'elementor_';

	public static function get_db_key(): string {
		return static::DB_KEY_PREFIX . static::get_key();
	}

	public static function get_value() {
		$value = get_user_option( static::get_db_key(), get_current_user_id() );

		if ( false === $value ) {
			$value = static::get_default();
		}

		return $value;
	}

	public static function setter( $value ): bool {
		return update_user_option( get_current_user_id(), static::get_db_key(), $value );
	}

	protected static function deleter(): bool {
		return delete_user_option( get_current_user_id(), static::get_db_key() );
	}

	protected static function has_permission( $value ): bool {
		return is_user_logged_in() || current_user_can( 'manage_options' );
	}
}
