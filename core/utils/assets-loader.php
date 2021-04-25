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
	const INLINE_CONTENT_KEY = '_elementor_inline_content';

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

	/**
	 * @param array $config {
	 *     @type string 'content_type'
	 *     @type string 'assets_category'
	 *     @type string 'asset_key'
	 *     @type number 'current_version'
	 *     @type string 'asset_path'
	 *     @type array 'data'
	 * }
	 */
	public function init_asset_inline_content( $config ) {
		$content_type = $config['content_type'];
		$assets_category = $config['assets_category'];
		$asset_key = $config['asset_key'];
		$current_version = $config['current_version'];

		if ( ! $this->assets_inline_content ) {
			$this->init_assets_inline_content_data();
		}

		if ( ! isset( $this->assets_inline_content[ $content_type ] ) ) {
			$this->assets_inline_content[ $content_type ] = [];
		}

		if ( ! isset( $this->assets_inline_content[ $content_type ][ $assets_category ] ) ) {
			$this->assets_inline_content[ $content_type ][ $assets_category ] = [];
		}

		$assets_data = $this->assets_inline_content[ $content_type ][ $assets_category ];

		$is_asset_inline_content_exist = isset( $assets_data[ $asset_key ] );

		if ( ! $is_asset_inline_content_exist || $this->is_asset_version_changed( $assets_data[ $asset_key ], $current_version ) ) {
			if ( 'css' === $content_type ) {
				$asset_content = $this->get_asset_css( $config );
			} elseif ( 'svg' === $content_type ) {
				$asset_content = $this->get_svg_data( $config );
			}

			$this->save_asset_inline_content( $content_type, $assets_category, $asset_key, $asset_content, $current_version );
		}
	}

	/**
	 * @param array $config {
	 *     @type string 'content_type'
	 *     @type string 'assets_category'
	 *     @type string 'asset_key'
	 *     @type number 'current_version'
	 *     @type string 'asset_path'
	 *     @type array 'data'
	 * }
	 */
	public function get_asset_inline_content( array $config ) {
		$this->init_asset_inline_content( $config );

		$content_type = $config['content_type'];
		$assets_category = $config['assets_category'];
		$asset_key = $config['asset_key'];

		return $this->assets_inline_content[ $content_type ][ $assets_category ][ $asset_key ]['content'];
	}

	private function is_asset_version_changed( $asset_data, $current_version ) {
		if ( ! isset( $asset_data['version'] ) ) {
			return false;
		}

		return $current_version !== $asset_data['version'];
	}

	private function get_asset_css( $config ) {
		$asset_path = $config['asset_path'];

		if ( ! file_exists( $asset_path ) ) {
			return '';
		}

		$content_type = $config['content_type'];
		$assets_category = $config['assets_category'];
		$asset_key = $config['asset_key'];
		$asset_url = $config['data']['asset_url'];

		$asset_css_file_size = $this->get_file_data( $content_type, $assets_category, $asset_key, $asset_path, 'size' );

		// If the file size is more than 8KB then calling the external CSS file, otherwise, printing inline CSS.
		if ( $asset_css_file_size > 8000 ) {
			$asset_css = sprintf( '<link rel="stylesheet" href="%s">', $asset_url );
		} else {
			$asset_css = $this->get_file_data( $content_type, $assets_category, $asset_key, $asset_path, 'content' );
			$asset_css = sprintf( '<style>%s</style>', $asset_css );
		}

		return $asset_css;
	}

	private function get_file_data( $content_type, $assets_category, $asset_key, $asset_path, $data_type = '' ) {
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
		} elseif ( 'size' === $data_type ) {
			$data = filesize( $asset_path );
		}

		$this->files_data[ $content_type ][ $assets_category ][ $asset_key ][ $data_type ] = $data;

		return $data;
	}

	/**
	 * @param string $content_type
	 * @param string $assets_category
	 * @param string $asset_key
	 * @param string $content
	 * @param number $version
	 */
	private function save_asset_inline_content( $content_type, $assets_category, $asset_key, $content, $version ) {
		if ( ! $this->assets_inline_content ) {
			$this->init_assets_inline_content_data();
		}

		if ( ! isset( $this->assets_inline_content[ $content_type ] ) ) {
			$this->assets_inline_content[ $content_type ] = [];
		}

		if ( ! isset( $this->assets_inline_content[ $content_type ][ $assets_category ] ) ) {
			$this->assets_inline_content[ $content_type ][ $assets_category ] = [];
		}

		if ( ! isset( $this->assets_inline_content[ $content_type ][ $assets_category ][ $asset_key ] ) ) {
			$this->assets_inline_content[ $content_type ][ $assets_category ][ $asset_key ] = [];
		}

		$this->assets_inline_content[ $content_type ][ $assets_category ][ $asset_key ]['content'] = $content;

		$this->assets_inline_content[ $content_type ][ $assets_category ][ $asset_key ]['version'] = $version;

		update_option( self::INLINE_CONTENT_KEY, $this->assets_inline_content );
	}

	private function init_assets_inline_content_data() {
		$this->assets_inline_content = get_option( self::INLINE_CONTENT_KEY, [] );
	}

	private function reset_inline_content_css() {
		$assets_inline_content = get_option( self::INLINE_CONTENT_KEY, [] );

		if ( array_key_exists( 'css', $assets_inline_content ) ) {
			unset( $assets_inline_content['css'] );

			update_option( self::INLINE_CONTENT_KEY, $assets_inline_content );
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

	private function get_svg_data( $config ) {
		$asset_key = $config['asset_key'];

		/**
		 * Using the file_data_key to read the JSON file only once per icons type.
		 * When multiple icons are being read from the same file, the key should be the same for all icons.
		 * In case that the file_data_key was the asset_key, the file data was fetched repeatedly for each icon.
		 */
		$file_data_key = isset( $config['data']['file_data_key'] ) ? $config['data']['file_data_key'] : $asset_key;

		$svg_file_data = json_decode( $this->get_file_data( $config['content_type'], $config['assets_category'], $file_data_key, $config['asset_path'], 'content' ), true );

		/**
		 * Each JSON file can have a different structure, therefore using a callback from the config to get the svg data.
		 * The callback should get the file_data and return an associative array with the width, height and path values.
		 */
		$svg_data = isset( $config['actions']['get_svg_data_from_file'] ) ? call_user_func( $config['actions']['get_svg_data_from_file'], $svg_file_data ) : $svg_file_data[ $asset_key ];

		return [
			'width' => $svg_data['width'],
			'height' => $svg_data['height'],
			'path' => $svg_data['path'],
			'key' => $asset_key,
		];
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
