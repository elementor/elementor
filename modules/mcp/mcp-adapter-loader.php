<?php

namespace Elementor\Modules\Mcp;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Preload the standalone `wordpress/mcp-adapter` plugin so its `WP\MCP\*`
 * classes win autoload resolution over older copies vendored by other plugins
 * (notably WooCommerce, which ships v0.1.0 through a prepended Jetpack
 * classmap and would otherwise cause mixed-class failures).
 *
 * @see https://elementor.atlassian.net/browse/ED-24917
 */
class Mcp_Adapter_Loader {

	const MINIMUM_VERSION = '0.5.0';

	public static function preload(): void {
		$plugin_file   = WP_PLUGIN_DIR . '/mcp-adapter/mcp-adapter.php';
		$autoload_file = WP_PLUGIN_DIR . '/mcp-adapter/vendor/autoload.php';

		if ( ! self::should_preload( $plugin_file, $autoload_file ) ) {
			return;
		}

		$loader = require $autoload_file;

		if ( ! $loader instanceof \Composer\Autoload\ClassLoader ) {
			return;
		}

		self::prepend( $loader );

		add_action(
			'plugins_loaded',
			static function () use ( $loader ) {
				self::prepend( $loader );
			},
			0
		);
	}

	public static function should_preload( string $plugin_file, string $autoload_file ): bool {
		if ( ! is_readable( $plugin_file ) || ! is_readable( $autoload_file ) ) {
			return false;
		}

		$version = self::read_version( $plugin_file );

		return ! empty( $version ) && version_compare( $version, self::MINIMUM_VERSION, '>=' );
	}

	public static function read_version( string $plugin_file ): string {
		$data = get_file_data( $plugin_file, [ 'Version' => 'Version' ] );

		return $data['Version'] ?? '';
	}

	private static function prepend( \Composer\Autoload\ClassLoader $loader ): void {
		$loader->unregister();
		$loader->register( true );
	}
}
