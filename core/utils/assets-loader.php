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
	const ASSETS_DATA_KEY =  'elementor_assets_data';

	private $allowed_assets_data_types = [ 'widgets_css' ];

	private $assets;

	private $assets_data;

	private $files_data;

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

	public function enable_asset( $asset_type, $asset_name ) {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		$this->assets[ $asset_type ][ $asset_name ]['enabled'] = true;
	}

	public function add_assets( $assets ) {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		$this->assets = array_replace_recursive( $this->assets, $assets );
	}

	public function get_assets_data( $type = '', $key = '' ) {
		if ( ! $this->assets_data ) {
			$this->assets_data = get_option( self::ASSETS_DATA_KEY );
		}

		if ( $type && $key ) {
			return $this->assets_data[ $type ][ $key ];
		}

		return $this->assets_data;
	}

	public function save_asset_data( $type, $key, $value ) {
		if ( ! in_array( $type, $this->allowed_assets_data_types, TRUE ) ) {
			return;
		}

		$assets_data = $this->get_assets_data();

		if ( ! $assets_data ) {
			$assets_data = [];
		} elseif ( ! $assets_data[ $type ] ) {
			$assets_data[ $type ] = [];
		}

		$assets_data[ $type ][ $key ] = $value;

		update_option( self::ASSETS_DATA_KEY, $assets_data );
	}

	public function get_file_data( $src, $data_type = '' ) {
		if ( ! $this->files_data[ $src ] ) {
			$this->files_data[ $src ] = wp_remote_get( $src );
		}

		$file_data = $this->files_data[ $src ];

		if ( 'content' === $data_type ) {
			return $file_data[ 'body' ];
		} elseif ( 'size' === $data_type ) {
			return $file_data['headers']['content-length'];
		}

		return $file_data;
	}

	public function enqueue_assets() {
		$assets = $this->get_assets();
		$is_preview_mode = Plugin::$instance->preview->is_preview_mode();
		$is_optimized_assets_loading = Plugin::$instance->experiments->is_feature_active( 'e_optimized_assets_loading' );

		foreach ( $assets as $assets_type => $assets_type_data ) {
			foreach ( $assets_type_data as $asset_name => $asset_data ) {
				if ( ! empty( $asset_data['enabled'] ) || $is_preview_mode || ! $is_optimized_assets_loading ) {
					if ( 'scripts' === $assets_type ) {
						wp_enqueue_script( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'], true );
					} else {
						wp_enqueue_style( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'] );
					}
				}
			}
		}
	}
}
