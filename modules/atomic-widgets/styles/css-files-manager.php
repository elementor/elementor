<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class CSS_Files_Manager {
	public static function enqueue( string $key, callable $get_css ): bool {
		$style = Style_File::create( $key );
		$css = $get_css();

		if ( empty( $css['content'] ) ) {
			return false;
		}

		$style->set_content( $css['content'] );

		$bytes_written = self::write_to_file( $style );

		if ( false === $bytes_written ) {
			return false;
		}

		wp_enqueue_style(
			$style->get_handle(),
			$style->get_versioned_url(),
			[],
			null,
			$css['media'] ?? 'all'
		);

		return true;
	}

	private static function write_to_file( Style_File $style ) {
		return $style->write();
	}

	public static function delete( string $key ): bool {
		$style = Style_File::create( $key );

		return $style->delete();
	}

	public static function exists( string $key ): bool {
		$style = Style_File::create( $key );

		return $style->exists();
	}

	public static function get_url( string $key ): string {
		$style = Style_File::create( $key );

		return $style->get_versioned_url();
	}
}
