<?php

namespace Elementor\V4;

class Widgets_Autoloader {

	protected static $is_loaded = false;

	public static function load() {
		if ( self::$is_loaded ) {
			return;
		}

		self::$is_loaded = true;

		$v4_atomic_widgets_path = ELEMENTOR_PATH . 'includes/widgets/v4/';
		$files_or_folders = glob( $v4_atomic_widgets_path . '*/' );
		foreach ( $files_or_folders as $file_or_folder ) {
			if ( is_dir( $file_or_folder ) ) {
				$files = glob( $file_or_folder . '*.php' );
				foreach ( $files as $file ) {
					include $file;
				}
			}
		}
	}
}
