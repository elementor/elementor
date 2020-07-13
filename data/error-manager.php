<?php
namespace Elementor\Data;

class Error_Manager {
	const ERROR_TYPES = E_ALL;

	/**
	 * @var callable|null
	 */
	private static $custom_callback = null;

	private static $is_registered = false;

	public static function handler( $error_number, $error_message, $error_file, $error_line ) {
		$error_file = str_replace( dirname( ELEMENTOR__FILE__ ), '', $error_file );
		$error_file = trim( $error_file, '/' );
		$error = new \WP_Error( $error_number, $error_message, [
			'error_number' => $error_number,
			'error_message' => $error_message,
			'error_file' => $error_file,
			'error_line' => $error_line,
		] );

		$callback = self::$custom_callback;

		return $callback( $error );
	}

	public static function register_handler( callable $callback ) {
		self::$custom_callback = $callback;
		self::$is_registered = true;

		set_error_handler( [ self::class, 'handler' ], self::ERROR_TYPES );
	}

	public static function unregister_handler() {
		self::$is_registered = false;

		restore_error_handler();
	}

	public static function is_registered() {
		return self::$is_registered;
	}
}
