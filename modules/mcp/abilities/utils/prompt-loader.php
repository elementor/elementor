<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Prompt_Loader {

	public static function load( string $name ): string {
		$path = __DIR__ . '/../../static-resources/abilities/' . $name . '.md';

		if ( ! file_exists( $path ) ) {
			return '';
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return file_get_contents( $path );
	}
}
