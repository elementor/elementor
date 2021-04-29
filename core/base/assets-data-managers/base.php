<?php
namespace Elementor\Core\Base\Assets_Data_Managers;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Assets Data.
 *
 * @since 3.3.0
 */
abstract class Base {
	const ASSETS_DATA_KEY = '_elementor_assets_data';

	/**
	 * @var array
	 */
	protected $assets_data;

	/**
	 * @var string
	 */
	protected $content_type;

	/**
	 * @var string
	 */
	protected $assets_category;

	/**
	 * @var array
	 */
	private $assets_config;

	/**
	 * Get Asset Content.
	 *
	 * Responsible for extracting the asset data from a certain file.
	 * Will be triggered automatically when the asset data does not exist, or when the asset version was changed.
	 *
	 * @since 3.3.0
	 * @access public
	 *
	 * @return string
	 */
	abstract protected function get_asset_content();

	/**
	 * Get Asset Key.
	 *
	 * The asset data will be saved in the DB under this key.
	 *
	 * @since 3.3.0
	 * @access protected
	 *
	 * @return string
	 */
	protected function get_asset_key() {
		return $this->assets_config['asset_key'];
	}

	/**
	 * Get Relative Version.
	 *
	 * The asset data will be re-evaluated according the version number.
	 *
	 * @since 3.3.0
	 * @access protected
	 *
	 * @return string
	 */
	protected function get_relative_version() {
		return $this->assets_config['relative_version'];
	}

	/**
	 * Get Asset Path.
	 *
	 * The asset data will be extracted from the file path.
	 *
	 * @since 3.3.0
	 * @access protected
	 *
	 * @return string
	 */
	protected function get_asset_path() {
		return $this->assets_config['asset_path'];
	}

	/**
	 * Get Config Data.
	 *
	 * Holds a unique data relevant for the specific assets category type.
	 *
	 * @since 3.3.0
	 * @access protected
	 *
	 * @return string|array
	 */
	protected function get_config_data( $key = '' ) {
		if ( isset( $this->assets_config['data'] ) ) {
			if ( $key ) {
				if ( isset( $this->assets_config['data'][ $key ] ) ) {
					return $this->assets_config['data'][ $key ];
				}

				return '';
			}

			return $this->assets_config['data'];
		}

		return [];
	}

	/**
	 * Set Asset Data.
	 *
	 * Responsible for setting the current asset data.
	 *
	 * @since 3.3.0
	 * @access protected
	 *
	 * @return void
	 */
	protected function set_asset_data( $asset_key ) {
		$asset_content = $this->get_asset_content();
		$relative_version = $this->get_relative_version();

		if ( ! isset( $this->assets_data[ $asset_key ] ) ) {
			$this->assets_data[ $asset_key ] = [];
		}

		$this->assets_data[ $asset_key ]['content'] = $asset_content;
		$this->assets_data[ $asset_key ]['version'] = $relative_version;

		$this->save_asset_data( $asset_key );
	}

	/**
	 * Save Asset Data.
	 *
	 * Responsible for saving the asset data in the DB.
	 *
	 * @since 3.3.0
	 * @access protected
	 *
	 * @return void
	 */
	protected function save_asset_data( $asset_key ) {
		$assets_data = get_option( self::ASSETS_DATA_KEY, [] );
		$content_type = $this->content_type;
		$assets_category = $this->assets_category;

		if ( ! isset( $assets_data[ $content_type ] ) ) {
			$assets_data[ $content_type ] = [];
		}

		if ( ! isset( $assets_data[ $content_type ][ $assets_category ] ) ) {
			$assets_data[ $content_type ][ $assets_category ] = [];
		}

		$assets_data[ $content_type ][ $assets_category ][ $asset_key ] = $this->assets_data[ $asset_key ];

		update_option( self::ASSETS_DATA_KEY, $assets_data );
	}

	/**
	 * Is Asset Version Changed.
	 *
	 * Responsible for comparing the saved asset data version to the current relative version.
	 *
	 * @since 3.3.0
	 * @access protected
	 *
	 * @return boolean
	 */
	protected function is_asset_version_changed( $asset_data ) {
		if ( ! isset( $asset_data['version'] ) ) {
			return true;
		}

		return $this->get_relative_version() !== $asset_data['version'];
	}

	/**
	 * @param array $config {
	 *     @type string 'asset_key'
	 *     @type string 'relative_version'
	 *     @type string 'asset_path'
	 *     @type array 'data'
	 * }
	 */
	public function init_asset_data( $config ) {
		$this->assets_config = $config;

		$asset_key = $config['asset_key'];

		$asset_data = isset( $this->assets_data[ $asset_key ] ) ? $this->assets_data[ $asset_key ] : [];

		if ( ! $asset_data || $this->is_asset_version_changed( $asset_data ) ) {
			$this->set_asset_data( $asset_key );
		}
	}

	/**
	 * @param array $config {
	 *     @type string 'asset_key'
	 *     @type string 'relative_version'
	 *     @type string 'asset_path'
	 *     @type array 'data'
	 * }
	 */
	public function get_asset_data( $config ) {
		$this->init_asset_data( $config );

		$asset_key = $config['asset_key'];

		return $this->assets_data[ $asset_key ]['content'];
	}

	public function __construct() {
		$assets_data = Plugin::$instance->assets_loader->get_assets_data();

		$content_type = $this->content_type;
		$assets_category = $this->assets_category;

		if ( ! isset( $assets_data[ $content_type ] ) ) {
			$assets_data[ $content_type ] = [];
		}

		if ( ! isset( $assets_data[ $content_type ][ $assets_category ] ) ) {
			$assets_data[ $content_type ][ $assets_category ] = [];
		}

		$this->assets_data = $assets_data[ $content_type ][ $assets_category ];
	}
}
