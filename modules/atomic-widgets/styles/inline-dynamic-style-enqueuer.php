<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Inline_Dynamic_Style_Enqueuer {
	public function enqueue( array $breakpoint_path, string $breakpoint_media, string $css, ?string $version, callable $path_to_handle ): void {
		if ( '' === $css ) {
			return;
		}

		$handle = call_user_func( $path_to_handle, $breakpoint_path );

		if ( 'all' !== $breakpoint_media ) {
			$css = $breakpoint_media . '{' . $css . '}';
		}

		wp_register_style( $handle, false, [], $version );
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );
	}
}
