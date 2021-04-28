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
 * @since 3.3.0
 */
class Assets_Loader extends Module {
	const ASSETS_DATA_KEY = '_elementor_assets_data';

	private $assets;

	private $assets_data;

	private $registered_assets_data;

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

	/**
	 * @param array $assets {
	 *     @type array 'styles'
	 *     @type array 'scripts'
	 * }
	 */
	public function enable_assets( array $assets_data ) {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		foreach ( $assets_data as $assets_type => $assets_list ) {
			foreach ( $assets_list as $asset_name ) {
				$this->assets[ $assets_type ][ $asset_name ]['enabled'] = true;
			}
		}
	}

	/**
	 * @param array $assets {
	 *     @type array 'styles'
	 *     @type array 'scripts'
	 * }
	 */
	public function add_assets( array $assets ) {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		$this->assets = array_replace_recursive( $this->assets, $assets );
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

	public function get_asset_data( $content_type, $assets_category, $asset_key ) {
		if ( ! $this->assets_data ) {
			$this->init_assets_inline_content_data();
		}

		if ( isset( $this->assets_data[ $content_type ][ $assets_category ][ $asset_key ] ) ) {
			return $this->assets_data[ $content_type ][ $assets_category ][ $asset_key ];
		}

		return null;
	}

	public function get_assets_data() {
		return get_option( self::ASSETS_DATA_KEY, [] );
	}

	public function get_file_data( $content_type, $assets_category, $asset_key, $asset_path, $data_type = '' ) {
		if ( isset( $this->files_data[ $content_type ][ $assets_category ][ $asset_key ][ $data_type ] ) ) {
			return $this->files_data[ $content_type ][ $assets_category ][ $asset_key ][ $data_type ];
		}

		if ( ! $this->files_data ) {
			$this->files_data = [];
		}

		if ( ! isset( $this->files_data[ $content_type ] ) ) {
			$this->files_data[ $content_type ] = [];
		}

		if ( ! isset( $this->files_data[ $content_type ][ $assets_category ] ) ) {
			$this->files_data[ $content_type ][ $assets_category ] = [];
		}

		if ( ! isset( $this->files_data[ $content_type ][ $assets_category ][ $asset_key ] ) ) {
			$this->files_data[ $content_type ][ $assets_category ][ $asset_key ] = [];
		}

		if ( 'content' === $data_type ) {
			$data = file_get_contents( $asset_path );

			if ( ! $data ) {
				$data = '';
			}
		} elseif ( 'size' === $data_type ) {
			$data = file_exists( $asset_path ) ? filesize( $asset_path ) : 0;
		}

		$this->files_data[ $content_type ][ $assets_category ][ $asset_key ][ $data_type ] = $data;

		return $data;
	}

	public function register_asset_data( $content_type, $assets_category, $asset_key, $content, $version ) {
		$this->registered_assets_data[ $content_type ][ $assets_category ][ $asset_key ][ 'content' ] = $content;
		$this->registered_assets_data[ $content_type ][ $assets_category ][ $asset_key ][ 'version' ] = $version;
	}

	public function get_registered_assets_data() {
		return $this->registered_assets_data;
	}

	public function save_registered_assets_data( $content_type, $assets_category ) {
		$assets_data = get_option( self::ASSETS_DATA_KEY, [] );

		if ( ! isset( $assets_data[ $content_type ] ) ) {
			$assets_data[ $content_type ] = [];
		}

		if ( ! isset( $assets_data[ $content_type ][ $assets_category ] ) ) {
			$assets_data[ $content_type ][ $assets_category ] = [];
		}

		$updated_category_assets_data = array_replace_recursive( $assets_data[ $content_type ][ $assets_category ], $this->registered_assets_data[ $content_type ][ $assets_category ] );

		$assets_data[ $content_type ][ $assets_category ] = $updated_category_assets_data;

		update_option( self::ASSETS_DATA_KEY, $assets_data );
	}

	private function init_assets_inline_content_data() {
		$this->assets_data = get_option( self::ASSETS_DATA_KEY, [] );
	}

	private function reset_inline_content_css() {
		$assets_inline_content = get_option( self::ASSETS_DATA_KEY, [] );

		if ( array_key_exists( 'css', $assets_inline_content ) ) {
			unset( $assets_inline_content['css'] );

			update_option( self::ASSETS_DATA_KEY, $assets_inline_content );
		}
	}

	private function register_assets() {
		$assets = $this->get_assets();

		foreach ( $assets as $assets_type => $assets_type_data ) {
			foreach ( $assets_type_data as $asset_name => $asset_data ) {
				if ( 'scripts' === $assets_type ) {
					wp_register_script( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'], true );
				} else {
					wp_register_style( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'] );
				}
			}
		}
	}

	public function __construct() {
		parent::__construct();

		if ( Plugin::$instance->experiments->is_feature_active( 'e_optimized_css_loading' ) ) {
			// Reset the inline content CSS when regenerating CSS from the dashboard.
			add_action( 'elementor/core/files/clear_cache', function() {
				$this->reset_inline_content_css();
			} );
		}

		$this->register_assets();
	}
}
