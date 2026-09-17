<?php
namespace Elementor\Core\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Content_Render_Mode {

	const NORMAL = 'normal';

	const MARKDOWN = 'markdown';

	private static $current_mode = self::NORMAL;

	public static function get_current(): string {
		return self::$current_mode;
	}

	public static function set_current( string $mode ): void {
		self::$current_mode = $mode;
	}

	public static function is( string $mode ): bool {
		return self::get_current() === $mode;
	}

	public static function execute_as( string $mode, callable $callback ) {
		$previous_mode = self::get_current();
		$should_reset = $previous_mode !== $mode;

		if ( $should_reset ) {
			self::set_current( $mode );
		}

		try {
			return $callback();
		} finally {
			if ( $should_reset ) {
				self::set_current( $previous_mode );
			}
		}
	}
}
