<?php
namespace Elementor\Core\Editor\Config_Providers;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Config_Provider implements Config_Provider_Interface {

	/**
	 * Cached script assets.
	 *
	 * @var Collection
	 */
	private $packages_script_assets;

	public function get_script_configs() {
		$packages_script_configs = $this->get_packages_script_assets();

		$apps_handles = $packages_script_configs
			->filter( function ( $script_config ) {
				return 'app' === $script_config['type'];
			} )
			->map( function ( $script_config ) {
				return $script_config['handle'];
			} )
			->values();

		$loader_script_config = [
			'handle' => 'elementor-editor-loader-v2',
			'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-loader-v2{{MIN_SUFFIX}}.js',
			'deps' => array_merge(
				[ 'elementor-editor' ],
				$apps_handles,
			),
		];

		return array_merge(
			Editor_Common_Configs::get_script_configs(),
			$packages_script_configs->values(),
			[ $loader_script_config ]
		);
	}

	public function get_script_handles_to_enqueue() {
		$types_to_enqueue = [ 'extension' ];

		return $this->get_packages_script_assets()
			->filter( function ( $script_config ) use ( $types_to_enqueue ) {
				return in_array( $script_config['type'], $types_to_enqueue, true );
			} )
			->map( function ( $script_config ) {
				return $script_config['handle'];
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

	private function map_packages_to_wp_handle( $packages_data, $deps ) {
		return array_map( function ( $package_name ) use ( $packages_data ) {
			return $packages_data[ $package_name ]['handle'] ?? $package_name;
		}, $deps );
	}

	private function get_packages_script_assets() {
		if ( ! $this->packages_script_assets ) {
			// Loading the file that is responsible for registering the packages in the filter.
			require_once ELEMENTOR_ASSETS_PATH . 'js/packages/loader.php';

			$packages_data = apply_filters( 'elementor/packages/config', [] );

			// explain..
			$type_exceptions = [
				'@elementor/ui' => 'util',
			];

			$this->packages_script_assets = Collection::make( $packages_data )
				->map_with_keys( function ( $data, $name ) use ( $packages_data, $type_exceptions ) {
					$type = $type_exceptions[ $name ] ?? $data['type'] ?? 'extension';

					return [
						$name => [
							'handle' => $data['handle'],
							'src' => $data['url'] . $data['entry'] . '{{MIN_SUFFIX}}.js',
							'deps' => $this->map_packages_to_wp_handle( $packages_data, $data['deps'] ),
							'i18n' => $data['i18n'],
							'type' => $type,
						],
					];
				} );
		}

		return $this->packages_script_assets;
	}
}
