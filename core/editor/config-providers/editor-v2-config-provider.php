<?php
namespace Elementor\Core\Editor\Config_Providers;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Config_Provider implements Config_Provider_Interface {
	const APP_PACKAGE = 'editor';

	const EXTENSION_PACKAGES = [
		'documents',
		'documents-ui',
		'elements-panel',
		'finder',
		'help',
		'history',
		'responsive',
		'site-settings',
		'structure',
		'theme-builder',
		'top-bar',
		'user-preferences',
	];

	const UTIL_PACKAGES = [
		'icons',
		'locations',
		'ui',
		'v1-adapters',
		'store',
	];

	/**
	 * Cached script assets.
	 *
	 * @var Collection
	 */
	private $packages_script_assets;

	public function get_script_configs() {
		$packages_script_configs = $this->get_packages_script_assets()
			->map( function ( $script_asset, $package_name ) {
				return [
					'handle' => $script_asset['handle'],
					'src' => "{{ELEMENTOR_ASSETS_URL}}js/packages/{$package_name}{{MIN_SUFFIX}}.js",
					'deps' => $script_asset['deps'],
					'i18n' => [
						'domain' => 'elementor',
						'replace_requested_file' => true,
					],
				];
			} );

		$editor_script_config = $packages_script_configs->get( static::APP_PACKAGE );

		$loader_script_config = [
			'handle' => 'elementor-editor-loader-v2',
			'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-loader-v2{{MIN_SUFFIX}}.js',
			'deps' => array_merge(
				[ 'elementor-editor' ],
				$editor_script_config ? [ $editor_script_config['handle'] ] : []
			),
		];

		return array_merge(
			Editor_Common_Configs::get_script_configs(),
			$packages_script_configs->values(),
			[ $loader_script_config ]
		);
	}

	public function get_script_handles_to_enqueue() {
		return $this->get_packages_script_assets()
			->filter( function ( $script_asset, $package_name ) {
				return in_array( $package_name, static::EXTENSION_PACKAGES, true );
			} )
			->map( function ( $script_asset ) {
				return $script_asset['handle'];
			} )
			// Must be last.
			->push( 'elementor-editor-loader-v2' )
			->values();
	}

	public function get_client_settings() {
		$common_configs = Editor_Common_Configs::get_client_settings();

		$v2_config = [
			'handle' => 'elementor-editor-loader-v2',
			'name' => 'elementorEditorV2Settings',
			'settings' => [
				'urls' => [
					'admin' => admin_url(),
				],
			],
		];

		return array_merge( $common_configs, [ $v2_config ] );
	}

	public function get_style_configs() {
		return array_merge(
			Editor_Common_Configs::get_style_configs(),
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

	public function get_additional_template_paths() {
		return Editor_Common_Configs::get_additional_template_paths();
	}

	private function get_packages_script_assets() {
		if ( ! $this->packages_script_assets ) {
			$this->packages_script_assets = Collection::make( [ static::APP_PACKAGE ] )
				->merge( static::EXTENSION_PACKAGES )
				->merge( static::UTIL_PACKAGES )
				->map_with_keys( function ( $package_name ) {
					$assets_path = ELEMENTOR_ASSETS_PATH;
					$script_asset_path = "{$assets_path}js/packages/{$package_name}.asset.php";

					if ( ! file_exists( $script_asset_path ) ) {
						return [];
					}

					/** @var array{ handle: string, deps: string[] } $script_asset */
					$script_asset = require $script_asset_path;

					return [ $package_name => $script_asset ];
				} );
		}

		return $this->packages_script_assets;
	}
}
