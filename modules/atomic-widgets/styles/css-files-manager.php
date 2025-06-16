<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class CSS_Files_Manager {
	CONST DEFAULT_CSS_DIR = 'elementor/css/';
	CONST PERMISSIONS = 0644;

	public function create(string $filename, callable $get_css ): Style_File {
		$css = $get_css();

		if ( empty( $css['content'] ) ) {
			throw new \Exception( 'CSS content is empty for file: ' . $filename );
		}

		$style_file = Style_File::make( $filename, self::DEFAULT_CSS_DIR );

		$path = $style_file->get_path();
		$filesystem_path = $this->get_filesystem_path( $path );

		$filesystem = $this->get_filesystem();
		$bytes_written = $filesystem->put_contents( $filesystem_path, $css['content'], self::PERMISSIONS );

		if ( false === $bytes_written ) {
			throw new \Exception( 'Could not write the file: ' . $filesystem_path );
		}

		return $style_file;
	}

	private function get_filesystem(): \WP_Filesystem_Base {
		global $wp_filesystem;

		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		return $wp_filesystem;
	}

	private function get_filesystem_path( $path ): string {
		$filesystem = self::get_filesystem();

		return str_replace( ABSPATH, $filesystem->abspath(), $path );
	}
}
