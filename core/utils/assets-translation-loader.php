<?php

namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Assets_Translation_Loader {
	private $handles;

	private $replace_callback;

	private $domain;

	public function __construct( $handles, $domain = null, $replace_callback = null ) {
		$this->handles = $handles;
		$this->domain = $domain;
		$this->replace_callback = $replace_callback;
	}

	public static function for_handles( $handles, $domain = null, $replace_callback = null ) {
		$instance = new self( $handles, $domain, $replace_callback );

		$instance->set_domain();
		$instance->register_hooks();
	}

	public function set_domain() {
		if ( empty( $this->domain ) || ! is_string( $this->domain ) ) {
			return;
		}

		foreach ( $this->handles as $handle ) {
			wp_set_script_translations( $handle, $this->domain );
		}
	}

	public function register_hooks() {
		add_filter( 'load_script_textdomain_relative_path', function ( $relative_path, $src ) {
			return $this->replace_requested_translation_file( $relative_path, $src );
		}, 10, 2 );
	}

	/**
	 * The purpose of this function is to replace the requested translation file
	 * with a file that contains all the translations for specific scripts.
	 *
	 * When developing a module and using Webpack's dynamic load feature, the script will be split into multiple chunks.
	 * As a result, the WordPress translations expressions will also be split into multiple files.
	 * Therefore, we replace the requested translation file with another file (generated in the build process)
	 * that contains all the translations for the specific script (including dynamically loaded chunks).
	 *
	 * Want to go deeper? Read the following article:
	 * @see https://developer.wordpress.com/2022/01/06/wordpress-plugin-i18n-webpack-and-composer/
	 *
	 * @param string $relative_path
	 * @param string $src
	 *
	 * @return string
	 */
	private function replace_requested_translation_file( $relative_path, $src ) {
		$handle = $this->get_handle_by_src( $src );

		if ( ! $handle ) {
			return $relative_path;
		}

		if ( is_callable( $this->replace_callback ) ) {
			$callback = $this->replace_callback;

			return $callback( $relative_path, $src, $handle );
		}

		return $this->default_replace_callback( $relative_path );
	}

	private function get_handle_by_src( $src ) {
		$wp_scripts = wp_scripts();

		foreach ( $this->handles as $handle ) {
			if ( ! isset( $wp_scripts->registered[ $handle ] ) ) {
				continue;
			}

			$asset_path = $wp_scripts->registered[ $handle ]->src;

			if ( $asset_path === $src ) {
				return $handle;
			}
		}

		return null;
	}

	private function default_replace_callback( $relative_path ) {
		// Translations are always based on the non-minified filename.
		$relative_path_without_ext = preg_replace( '/(\.min)?\.js$/i', '', $relative_path );

		// By default, we suffix the file with `.strings` (e.g 'assets/js/editor.js' => 'assets/js/editor.strings.js').
		return implode( '.', [
			$relative_path_without_ext,
			'strings',
			'js',
		] );
	}
}
