<?php

namespace Elementor\Modules\ElementorCapabilitiesMcp;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	private const PACKAGE_NAME = 'elementor-capabilities-mcp';

	private const REQUIRED_PACKAGES = [
		'utils',
		'schema',
		'elementor-mcp-common',
		'editor-v1-adapters',
		'editor-mcp',
		'elementor-capabilities-mcp',
	];

	public function get_name(): string {
		return self::PACKAGE_NAME;
	}

	public static function is_active(): bool {
		return is_admin();
	}

	public function __construct() {
		parent::__construct();

		add_action( 'admin_enqueue_scripts', [ $this, 'register_packages' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ], 20 );

		add_filter( 'elementor/editor/v2/packages', [ $this, 'add_editor_packages' ] );
	}

	public function add_editor_packages( array $packages ): array {
		$packages[] = self::PACKAGE_NAME;

		return $packages;
	}

	public function register_packages(): void {
		$suffix = Utils::is_script_debug() ? '' : '.min';

		foreach ( self::REQUIRED_PACKAGES as $package ) {
			$asset_file = ELEMENTOR_ASSETS_PATH . "js/packages/{$package}/{$package}.asset.php";

			if ( ! file_exists( $asset_file ) ) {
				continue;
			}

			$asset = require $asset_file;
			$handle = $asset['handle'] ?? "elementor-v2-{$package}";

			if ( wp_script_is( $handle, 'registered' ) ) {
				continue;
			}

			wp_register_script(
				$handle,
				ELEMENTOR_ASSETS_URL . "js/packages/{$package}/{$package}{$suffix}.js",
				$asset['deps'] ?? [],
				ELEMENTOR_VERSION,
				true
			);
		}
	}

	public function enqueue_scripts(): void {
		wp_enqueue_script( 'elementor-v2-' . self::PACKAGE_NAME );
	}
}
