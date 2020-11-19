<?php
namespace Elementor\Core\Utils;

use Elementor\Core\Base\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor controls assets loader.
 *
 * A class that is responsible for conditionally enqueuing styles and script assets that were pre-enabled.
 *
 * @since 3.1.0
 */
class Assets_Loader extends Module {
	private $assets;

	public function get_name() {
		return 'assets_loader';
	}

	private function init_assets() {
		$this->assets = [
			'styles' => [
				'e-animations' => [
					'file_name' => 'animations',
					'relative_url' => 'assets/lib/animations/',
					'add_min_suffix' => true,
					'version' => ELEMENTOR_VERSION,
					'dependencies' => [],
				],
			],
			'scripts' => [],
		];
	}

	private function get_assets() {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		return $this->assets;
	}

	public function enable_asset( $asset_type, $asset_name ) {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		$this->assets[ $asset_type ][ $asset_name ]['enabled'] = true;
	}

	public function enqueue_assets() {
		$assets = $this->get_assets();

		foreach( $assets as $assets_type ) {
			foreach( $assets_type as $asset_name => $asset_data ) {
				if ( array_key_exists( 'enabled', $asset_data ) ) {
					if ( 'scripts' === $assets_type ) {
						$file_path = $this->get_js_assets_url( $asset_data['file_name'], $asset_data['relative_url'], $asset_data['add_min_suffix'] );

						wp_enqueue_script( $asset_name, $file_path, $asset_data['dependencies'], $asset_data['version'], $asset_data['in_footer'] );
					} else {
						$file_path = $this->get_css_assets_url( $asset_data['file_name'], $asset_data['relative_url'], $asset_data['add_min_suffix'] );

						wp_enqueue_style( $asset_name, $file_path, $asset_data['dependencies'], $asset_data['version'] );
					}
				}
			}
		}
	}
}
