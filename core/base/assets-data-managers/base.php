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

	protected $assets_data;

	protected $content_type;

	protected $assets_category;

	protected $assets_relative_version;

	abstract protected function get_relative_version();

	abstract protected function get_asset_content( $asset_key );

	protected function set_asset_data( $asset_key ) {
		$asset_content = $this->get_asset_content( $asset_key );
		$relative_version = $this->get_relative_version();

		if ( ! isset( $this->assets_data[ $asset_key ] ) ) {
			$this->assets_data[ $asset_key ] = [];
		}

		$this->assets_data[ $asset_key ]['content'] = $asset_content;
		$this->assets_data[ $asset_key ]['version'] = $relative_version;

		$this->save_asset_data( $asset_key );
	}

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

	protected function is_asset_version_changed( $asset_data ) {
		if ( ! isset( $asset_data['version'] ) ) {
			return true;
		}

		return $this->get_relative_version() !== $asset_data['version'];
	}

	public function init_asset_data( $asset_key ) {
		$asset_data = isset( $this->assets_data[ $asset_key ] ) ? $this->assets_data[ $asset_key ] : [];

		if ( ! $asset_data || $this->is_asset_version_changed( $asset_data ) ) {
			$this->set_asset_data( $asset_key );
		}
	}

	public function get_asset_data( $asset_key ) {
		$this->init_asset_data( $asset_key );

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
