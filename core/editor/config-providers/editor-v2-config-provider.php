<?php
namespace Elementor\Core\Editor\Config_Providers;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Config_Provider implements Config_Provider_Interface {
	const APP_PACKAGE = 'editor';

	const EXTENSION_PACKAGES = [
		'top-bar',
	];

	const UTIL_PACKAGES = [
		'locations',
		'ui',
	];

	/**
	 * Cached script assets.
	 *
	 * @var Collection
	 */
	private $packages_script_assets;

	public function get_script_configs() {
		$packages_script_configs = $this->get_packages_script_assets()->map( function ( $script_asset ) {
			return [
				'handle' => $script_asset['handle'],
				'path' => "{{ELEMENTOR_ASSETS_URL}}assets/js/{$script_asset['name']}{{MIN_SUFFIX}}.js",
				'deps' => $script_asset['deps'],
				'i18n' => [
					'domain' => 'elementor',
					'replace_requested_file' => true,
				],
			];
		} )->all();

		$loader_script_config = [
			'handle' => 'elementor-editor-loader-v2',
			'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-loader-v2{{MIN_SUFFIX}}.js',
			'deps' => [
				'elementor-editor',
				$packages_script_configs[ static::APP_PACKAGE ]['handle'],
			],
		];

		return array_merge(
			Editor_Common_Assets::get_script_configs(),
			$packages_script_configs,
			[ $loader_script_config ]
		);
	}

	public function get_script_handles_to_enqueue() {
		// TODO: Hook to enqueue scripts.

		return $this->get_packages_script_assets()
			->filter( function ( $script_asset, $package_name ) {
				return in_array( $package_name, static::EXTENSION_PACKAGES, true );
			} )
			->map( function ( $script_asset ) {
				return $script_asset['handle'];
			} )
			->push( 'elementor-editor-loader-v2' )
			->values();
	}

	public function get_style_configs() {
		return array_merge(
			Editor_Common_Assets::get_style_configs(),
			[
				[
					'handle' => 'elementor-editor-v2-overrides',
					'src' => '{{ELEMENTOR_ASSETS_URL}}css/editor-v2-overrides{{MIN_SUFFIX}}.css',
					'deps' => [ 'elementor-editor' ],
				],
			]
		);
	}

	public function get_style_handles_to_enqueue() {
		return [
			'elementor-editor-v2-overrides',
			'elementor-editor',
		];
	}

	public function get_template_body_file_path() {
		return __DIR__ . '/../templates/editor-body-v2.view.php';
	}

	private function get_packages_script_assets() {
		if ( ! $this->packages_script_assets ) {
			$this->packages_script_assets = Collection::make( [ self::APP_PACKAGE ] )
				->merge( self::EXTENSION_PACKAGES )
				->merge( self::UTIL_PACKAGES )
				->map_with_keys( function ( $package ) {
					$assets_path = ELEMENTOR_ASSETS_PATH;
					$script_asset_path = "{$assets_path}js/packages/{$package}.asset.php";

					if ( ! file_exists( $script_asset_path ) ) {
						return null;
					}

					$script_asset = require $script_asset_path;

					return [ $script_asset['name'] => $script_asset ];
				} )
				->filter();
		}

		return $this->packages_script_assets;
	}
}
