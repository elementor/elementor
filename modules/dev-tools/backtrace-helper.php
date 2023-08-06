<?php
namespace Elementor\Modules\DevTools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Backtrace_Helper {
	/**
	 * find_who_called_me
	 * Retrieves the function, class, file, line, type and name of the function that called the function that called this function.
	 *
	 * @param  int $stack_depth The depth of the stack to look for.
	 * @return array with the following keys:
	 * function - calling function
	 * class - calling class
	 * file - the file that contains the calling function
	 * line - location
	 * type - plugin or theme
	 * name - plugin/theme name
	 */
	public static function find_who_called_me( $stack_depth ) {
		// phpcs:disable
		$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS );
		// phpcs:enable
		$caller = [];
		if ( array_key_exists( $stack_depth, $backtrace ) ) {
			$caller = $backtrace[ $stack_depth ];
		}
		$caller_function = $caller['function'] ?? '';
		$caller_class = $caller['class'] ?? '';
		$caller_file = $caller['file'] ?? '';
		$caller_line = $caller['line'] ?? '';
		$source = self::get_source( $caller_file );

		$res = [
			'function' => $caller_function,
			'class' => $caller_class,
			'file' => $caller_file,
			'line' => $caller_line,
			'type' => $source['type'],
			'name' => $source['name'],
		];
		return $res;
	}

	private static function get_source( $filename ) {

		$name = 'Unknown';
		$type = '';

		if ( str_contains( $filename, WP_CONTENT_DIR ) ) {
			$file = str_replace( WP_CONTENT_DIR, '', $filename );
			$short_path = explode( '/', $file );
			if ( count( $short_path ) >= 3 ) {
				$type = $short_path[1];
				$name = $short_path[2];
			}
		}
		return [
			'name' => $name, // plugin/theme name.
			'type' => $type, // is it a plugin or a theme.
		];
	}
}
