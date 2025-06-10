<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class CSS_Files_Manager {
	public static function enqueue( string $key, callable $get_css ) {
		// TODO: Add caching mechanism to avoid re-generating CSS on every request.
		$style = new Style( $key );
		$css = $get_css();

		if ( empty( $css['content'] )) {
			return;
		}

		$style->append( $css['content'] );

		self::write_to_file( $style );

		wp_enqueue_style(
			$style->get_handle(),
			$style->get_src(),
			[],
			filemtime( $style->get_path() ),
			$css['media'] ?? 'all'
		);
	}

	private static function write_to_file( Style $style ) {
		file_put_contents(
			$style->get_path(),
			$style->get_content(),
		);
	}
}
