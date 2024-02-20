<?php
namespace Elementor\Core\Frontend;

use Elementor\Plugin;

class Performance {

	private static $use_style_controls = false;

	private static $is_frontend = null;

	private static $is_optimized_control_loading_feature_enabled = null;

	public static function set_use_style_controls( $bool ): void {
		static::$use_style_controls = (bool) $bool;
	}

	public static function is_use_style_controls(): bool {
		return static::$use_style_controls;
	}

	public static function should_optimize_controls() {
		if ( null === static::$is_frontend ) {
			static::$is_frontend = (
				! is_admin()
				&& ! Plugin::$instance->preview->is_preview_mode()
			);
		}

		return static::$is_frontend;
	}

	public static function is_optimized_control_loading_feature_enabled() {
		if ( null === static::$is_optimized_control_loading_feature_enabled ) {
			static::$is_optimized_control_loading_feature_enabled = Plugin::$instance->experiments->is_feature_active( 'e_optimized_control_loading' );
		}

		return static::$is_optimized_control_loading_feature_enabled;
	}
}
