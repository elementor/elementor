<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Page_Title {

	public static function render( string $title ): void {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Markup is escaped in get_markup().
		echo self::get_markup( $title );
	}

	public static function get_markup( string $title ): string {
		return sprintf(
			'<h1 class="wp-heading-inline">%1$s</h1><hr class="wp-header-end">',
			esc_html( $title )
		);
	}
}
