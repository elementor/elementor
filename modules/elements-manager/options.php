<?php
namespace Elementor\Modules\ElementsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Options {

	private static $disabled_widgets = null;

	public static function get_disabled_widgets() {
		if ( null === self::$disabled_widgets ) {
			self::$disabled_widgets = (array) get_option( 'elementor_disabled_widgets', [] );
		}
		return self::$disabled_widgets;
	}

	public static function update_disabled_widgets( $widgets ) {
		update_option( 'elementor_disabled_widgets', (array) $widgets );

		self::$disabled_widgets = null;
	}

	public static function is_widget_disabled( $widget_name ) {
		return in_array( $widget_name, self::get_disabled_widgets() );
	}
}
