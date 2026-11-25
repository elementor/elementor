<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Page_Title {

	public static function render( string $title, bool $visually_hidden = false ): void {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Markup is escaped in get_markup().
		echo self::get_markup( $title, $visually_hidden );
	}

	public static function get_markup( string $title, bool $visually_hidden = false ): string {
		return sprintf(
			'<h1 class="%1$s">%2$s</h1><hr class="wp-header-end">',
			$visually_hidden ? 'wp-heading-inline screen-reader-text' : 'wp-heading-inline',
			esc_html( $title )
		);
	}
}
