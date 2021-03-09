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

	private $allowed_assets_data_types = [ 'assets_css' ];

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

	public function get_asset_data( $data_type, $asset_name ) {
//		delete_option( self::ASSETS_DATA_KEY );
//		return;
		if ( ! in_array( $data_type, $this->allowed_assets_data_types, TRUE ) ) {
			return;
		}

		if ( ! $this->assets_data ) {
			$this->init_assets_data( $data_type );
		}

		if ( 'assets_css' === $data_type && ! array_key_exists( $asset_name, $this->assets_data[ $data_type ] ) ) {
			return $this->get_asset_css( $asset_name );
		}

		return $this->assets_data[ $data_type ][ $asset_name ];
	}

	public function save_asset_data( $data_type, $asset_name, $value ) {
		if ( ! in_array( $data_type, $this->allowed_assets_data_types, TRUE ) ) {
			return;
		}

		if ( ! $this->assets_data ) {
			$this->init_assets_data( $data_type );
		}

		$this->assets_data[ $data_type ][ $asset_name ] = $value;

		update_option( self::ASSETS_DATA_KEY, $this->assets_data );
	}

	private function get_file_data( $asset_file, $data_type = '' ) {
		if ( ! $this->files_data ) {
			$this->files_data = [];
		}

		if ( ! array_key_exists( $asset_file, $this->files_data ) ) {
			$this->files_data[ $asset_file ] = [];
		}

		if ( $data_type ) {
			// Getting data from local file path.
			$file_path = ELEMENTOR_ASSETS_PATH . $asset_file;

			if ( 'content' === $data_type ) {
				$data = file_get_contents( $file_path );
			} elseif ( 'size' === $data_type ) {
				$data = filesize( $file_path );
			}

			$this->files_data[ $asset_file ][ $data_type ] = $data;

			return $data;
		}

		return $this->files_data[ $asset_file ];
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

		if ( $data_type && ! array_key_exists( $data_type, $this->assets_data )  ) {
			$this->assets_data[ $data_type ] = [];
		}
	}

	private function get_asset_css( $asset_name ) {
		$asset_file = 'css/000-production-' . $asset_name . '.min.css';

		$asset_css_file_size = $this->get_file_data( $asset_file, 'size' );

		// If the file size is more than 2KB then calling the external CSS file, otherwise, printing inline CSS.
		if ( $asset_css_file_size > 2000 ) {
			$asset_css = sprintf( '<link rel="stylesheet" href="%s">', ELEMENTOR_ASSETS_URL . $asset_file );
		} else {
			$asset_css = $this->get_file_data( $asset_file, 'content' );
			$asset_css = sprintf( '<style>%s</style>', $asset_css );
		}

		$this->save_asset_data( 'assets_css', $asset_name, $asset_css );

		return $asset_css;
	}
}
