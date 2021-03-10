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

	// Initiate the assetes data - will be called by the get_asset_data
	public function init_asset_data() {
		// TODO: need to separate the get_asset_data and the saving part.
	}

	public function get_asset_data( $config ) {
		$asset_type = $config['type'];
		$asset_key = $config['key'];
		$asset_url = $config['url'];
		$asset_path = $config['path'];
		$version = $config['version'];

		if ( ! $this->assets_data ) {
			$this->init_assets_data( $asset_type );
		}

		$assets_data = $this->assets_data['inline-content'][ $asset_type ];

		$is_asset_data_exist = array_key_exists( $asset_key, $assets_data );

		if ( 'css' === $asset_type && ( ! $is_asset_data_exist || $this->is_asset_version_changed( $assets_data[ $asset_key ], $version ) ) ) {
			$asset_css = $this->get_asset_css( $asset_key, $asset_url, $asset_path );

			$this->save_asset_data( 'css', $asset_key, $asset_css, $version );

			return $asset_css;
		}

		return $this->assets_data['inline-content'][ $asset_type ][ $asset_key ]['data'];
	}

	public function save_asset_data( $data_type, $asset_key, $data, $version ) {
		if ( ! $this->assets_data ) {
			$this->init_assets_data( $data_type );
		}

		if ( ! array_key_exists( $asset_key, $this->assets_data[ 'inline-content' ] ) ) {
			$this->assets_data[ $data_type ][ $asset_key ] = [];
		}

		$this->assets_data[ $data_type ][ $asset_key ]['data'] = $data;

		$this->assets_data[ $data_type ][ $asset_key ]['version'] = $version;

		update_option( self::ASSETS_DATA_KEY, $this->assets_data );
	}

	private function is_asset_version_changed( $asset_data, $version ) {
		if ( ! array_key_exists( 'version', $asset_data ) ) {
			return false;
		}

		return $version !== $asset_data['version'];
	}

	private function get_file_data( $asset_key, $asset_path, $data_type = '' ) {
		if ( ! $this->files_data ) {
			$this->files_data = [];
		}

		if ( ! array_key_exists( $asset_key, $this->files_data ) ) {
			$this->files_data[ $asset_key ] = [];
		}

		if ( $data_type ) {
			if ( 'content' === $data_type ) {
				$data = file_get_contents( $asset_path );
			} elseif ( 'size' === $data_type ) {
				$data = filesize( $asset_path );
			}

			$this->files_data[ $asset_key ][ $data_type ] = $data;

			return $data;
		}

		return $this->files_data[ $asset_key ];
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

	private function init_assets_data( $data_type = '' ) {
		$this->assets_data = get_option( self::ASSETS_DATA_KEY, [] );

		if ( ! array_key_exists( 'inline-content', $this->assets_data ) ) {
			$this->assets_data['inline-content'] = [];
		}

		if ( $data_type && ! array_key_exists( $data_type, $this->assets_data['inline-content'] )  ) {
			$this->assets_data['inline-content'][ $data_type ] = [];
		}
	}

	private function get_asset_css( $asset_key, $asset_url, $asset_path ) {
		$asset_css_file_size = $this->get_file_data( $asset_key, $asset_path, 'size' );

		// If the file size is more than 2KB then calling the external CSS file, otherwise, printing inline CSS.
		if ( $asset_css_file_size > 2000 ) {
			$asset_css = sprintf( '<link rel="stylesheet" href="%s">', $asset_url );
		} else {
			$asset_css = $this->get_file_data( $asset_key, $asset_path, 'content' );
			$asset_css = sprintf( '<style>%s</style>', $asset_css );
		}

		return $asset_css;
	}
}
