<?php
namespace Elementor\Core\Frontend;

use Elementor\Plugin;

class Performance {

	private static $use_style_controls = false;

	private static $is_frontend = null;

	public static function set_use_style_controls( bool $is_use ): void {
		static::$use_style_controls = $is_use;
	}

	public static function is_use_style_controls(): bool {
		return static::$use_style_controls;
	}

	public static function should_optimize_controls() {
		if ( null !== static::$is_frontend ) {
			return static::$is_frontend;
		}

		$is_frontend = (
			! is_admin()
			&& ! Plugin::$instance->preview->is_preview_mode()
			&& ! defined( 'REST_REQUEST' )
		);

		// REST_REQUEST is defined only on `parse_request`; caching earlier locks REST requests into frontend mode.
		if ( ! $is_frontend || did_action( 'parse_request' ) ) {
			static::$is_frontend = $is_frontend;
		}

		return $is_frontend;
	}
}
