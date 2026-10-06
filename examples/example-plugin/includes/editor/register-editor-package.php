<?php
namespace Elementor_Example_Plugin\Editor;

use Elementor_Example_Plugin\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Register_Editor_Package {

	private const PACKAGE = 'editor-example-feature';

	private const SCRIPT_HANDLE = 'elementor-example-plugin-editor-example-feature';

	public static function register(): void {
		add_filter( 'elementor/editor/v2/packages', [ self::class, 'add_package' ] );
		add_action( 'elementor/editor/v2/scripts/register', [ self::class, 'register_script' ] );
		add_action( 'elementor/editor/v2/scripts/enqueue', [ self::class, 'enqueue_script' ] );
	}

	public static function add_package( array $packages ): array {
		return array_merge( $packages, [ self::PACKAGE ] );
	}

	public static function register_script(): void {
		if ( wp_script_is( self::SCRIPT_HANDLE, 'registered' ) ) {
			return;
		}

		$suffix = Utils::is_script_debug() ? '' : '.min';
		$base_path = plugin_dir_path( ELEMENTOR_EXAMPLE_PLUGIN_FILE ) . 'assets/js/editor-example-feature';
		$script_file = file_exists( "{$base_path}{$suffix}.js" ) ? "editor-example-feature{$suffix}.js" : 'editor-example-feature.js';

		wp_register_script(
			self::SCRIPT_HANDLE,
			plugins_url( "assets/js/{$script_file}", ELEMENTOR_EXAMPLE_PLUGIN_FILE ),
			[
				'elementor-v2-editor',
				'elementor-v2-editor-app-bar',
				'elementor-v2-editor-variables',
				'elementor-v2-editor-props',
				'elementor-v2-icons',
			],
			Plugin::VERSION,
			true
		);
	}

	public static function enqueue_script(): void {
		if ( wp_script_is( self::SCRIPT_HANDLE, 'registered' ) ) {
			wp_enqueue_script( self::SCRIPT_HANDLE );
		}
	}
}
