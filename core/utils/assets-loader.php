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
	const INLINE_CONTENT_KEY =  '_elementor_inline_content';

	private $assets;

	private $assets_inline_content;

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

	public function set_asset_inline_content( $config ) {
		$content_type = $config['content_type'];
		$asset_key = $config['asset_key'];
		$asset_url = $config['asset_url'];
		$asset_path = $config['asset_path'];
		$current_version = $config['current_version'];

		if ( ! $this->assets_inline_content ) {
			$this->init_assets_inline_content( $content_type );
		}

		$assets_data = $this->assets_inline_content[ $content_type ];

		$is_asset_inline_content_exist = array_key_exists( $asset_key, $assets_data );

		if ( 'css' === $content_type && ( ! $is_asset_inline_content_exist || $this->is_asset_version_changed( $assets_data[ $asset_key ], $current_version ) ) ) {
			$asset_css = $this->get_asset_css( $asset_key, $asset_url, $asset_path );

			$this->save_asset_inline_content( 'css', $asset_key, $asset_css, $current_version );
		}
	}

	public function get_asset_inline_content( $config ) {
		$this->set_asset_inline_content( $config );

		$content_type = $config['content_type'];
		$asset_key = $config['asset_key'];

		return $this->assets_inline_content[ $content_type ][ $asset_key ]['content'];
	}

	public function save_asset_inline_content( $content_type, $asset_key, $content, $version ) {
		if ( ! $this->assets_inline_content ) {
			$this->init_assets_inline_content( $content_type );
		}

		if ( ! array_key_exists( $asset_key, $this->assets_inline_content[ $content_type ] ) ) {
			$this->assets_inline_content[ $content_type ][ $asset_key ] = [];
		}

		$this->assets_inline_content[ $content_type ][ $asset_key ]['content'] = $content;

		$this->assets_inline_content[ $content_type ][ $asset_key ]['version'] = $version;

		update_option( self::INLINE_CONTENT_KEY, $this->assets_inline_content );
	}

	private function is_asset_version_changed( $asset_data, $current_version ) {
		if ( ! array_key_exists( 'version', $asset_data ) ) {
			return false;
		}

		return $current_version !== $asset_data['version'];
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

	private function init_assets_inline_content( $content_type = '' ) {
		$this->assets_inline_content = get_option( self::INLINE_CONTENT_KEY, [] );

		if ( $content_type && ! array_key_exists( $content_type, $this->assets_inline_content )  ) {
			$this->assets_inline_content[ $content_type ] = [];
		}
	}

	private function get_asset_css( $asset_key, $asset_url, $asset_path ) {
		if ( ! file_exists( $asset_path ) ) {
			return '';
		}

		$asset_css_file_size = $this->get_file_data( $asset_key, $asset_path, 'size' );

		// If the file size is more than 3KB then calling the external CSS file, otherwise, printing inline CSS.
		if ( $asset_css_file_size > 3000 ) {
			$asset_css = sprintf( '<link rel="stylesheet" href="%s">', $asset_url );
		} else {
			$asset_css = $this->get_file_data( $asset_key, $asset_path, 'content' );
			$asset_css = sprintf( '<style>%s</style>', $asset_css );
		}

		return $asset_css;
	}

	public function __construct() {
		if ( Plugin::$instance->experiments->is_feature_active( 'e_optimized_css_loading' ) ) {
			// Reset the inline content CSS when regenerating CSS from the dashboard.
			add_action( 'elementor/core/files/clear_cache', function() {
				$this->reset_inline_content_css();
			} );
		}

		$this->add_register_assets_action();
		$this->add_enqueue_assets_action();
	}

	private function reset_inline_content_css() {
		$assets_inline_content = get_option( self::INLINE_CONTENT_KEY, [] );

		if ( array_key_exists( 'css', $assets_inline_content ) ) {
			unset( $assets_inline_content['css'] );

			update_option( self::INLINE_CONTENT_KEY, $assets_inline_content );
		}
	}
}
