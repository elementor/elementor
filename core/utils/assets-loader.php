<?php
namespace Elementor\Core\Utils;

use Elementor\Core\Base\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor assets loader.
 *
 * A class that is responsible for conditionally enqueuing styles and script assets that were pre-enabled.
 *
 * @since 3.1.0
 */
class Assets_Loader extends Module {
	private $assets;

	public function get_name() {
		return 'assets-loader';
	}

	private function init_assets() {
		$this->assets = [
			'styles' => [],
			'scripts' => [],
		];

		do_action( 'elementor/assets_loader/assets_registered' );
	}

	public function get_assets() {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		return $this->assets;
	}

	public function enable_assets( $assets_data ) {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		foreach ( $assets_data as $assets_type => $assets_list ) {
			foreach ( $assets_list as $asset_name ) {
				$this->assets[ $assets_type ][ $asset_name ]['enabled'] = true;
			}
		}
	}

	public function add_assets( $assets ) {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		$this->assets = array_replace_recursive( $this->assets, $assets );
	}

	private function add_enqueue_assets_action() {
		$is_preview_mode = Plugin::$instance->preview->is_preview_mode();
		$is_optimized_assets_loading = Plugin::$instance->experiments->is_feature_active( 'e_optimized_assets_loading' );

		add_action( 'elementor/assets_loader/get_asset', function( $asset ) use ( &$is_preview_mode, &$is_optimized_assets_loading ) {
			$asset_data = $asset['data'];

			if ( ! empty( $asset_data['enabled'] ) || $is_preview_mode || ! $is_optimized_assets_loading ) {
				if ( 'scripts' === $asset['type'] ) {
					wp_enqueue_script( $asset['name'], $asset_data['src'], $asset_data['dependencies'], $asset_data['version'], true );
				} else {
					wp_enqueue_style( $asset['name'], $asset_data['src'], $asset_data['dependencies'], $asset_data['version'] );
				}
			}
		} );
	}

	private function add_register_assets_action() {
		add_action( 'elementor/assets_loader/get_asset', function( $asset ) {
			$asset_data = $asset['data'];

			if ( 'scripts' === $asset['type'] ) {
				wp_register_script( $asset['name'], $asset_data['src'], $asset_data['dependencies'], $asset_data['version'], true );
			} else {
				wp_register_style( $asset['name'], $asset_data['src'], $asset_data['dependencies'], $asset_data['version'] );
			}
		} );
	}

	public function handle_assets() {
		$assets = $this->get_assets();

		foreach ( $assets as $assets_type => $assets_type_data ) {
			foreach ( $assets_type_data as $asset_name => $asset_data ) {
				$asset = [
					'type' => $assets_type,
					'name' => $asset_name,
					'data' => $asset_data,
				];

				do_action( 'elementor/assets_loader/get_asset', $asset );
			}
		}
	}

	public function __construct() {
		parent::__construct();
		
		$this->add_register_assets_action();
		$this->add_enqueue_assets_action();
	}
}
