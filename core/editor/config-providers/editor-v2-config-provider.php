<?php
namespace Elementor\Core\Editor\Config_Providers;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Config_Provider implements Config_Provider_Interface {
	const PACKAGE_TYPE_APP = 'app';
	const PACKAGE_TYPE_EXTENSION = 'extension';
	const PACKAGE_TYPE_UTIL = 'util';

	/**
	 * Cached packages data.
	 *
	 * @var Collection
	 */
	private $packages_data;

	public function get_script_configs() {
		$packages_data = $this->get_packages_data();

		$apps_handles = $packages_data
			->filter( function ( $package_data ) {
				return static::PACKAGE_TYPE_APP === $package_data['type'];
			} )
			->map( function ( $package_data ) {
				return $package_data['handle'];
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
			$packages_data->values(),
			[ $loader_script_config ]
		);
	}

	public function get_script_handles_to_enqueue() {
		$types_to_enqueue = [ static::PACKAGE_TYPE_EXTENSION ];

		return $this->get_packages_data()
			->filter( function ( $package_data ) use ( $types_to_enqueue ) {
				return in_array( $package_data['type'], $types_to_enqueue, true );
			} )
			->map( function ( $package_data ) {
				return $package_data['handle'];
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

	private function map_packages_to_handles( $packages_data, $deps ) {
		return array_map( function ( $package_name ) use ( $packages_data ) {
			if ( ! empty( $packages_data[ $package_name ]['handle'] ) ) {
				return $packages_data[ $package_name ]['handle'];
			}

			if ( 0 === strpos( $package_name, '@wordpress/' ) ) {
				return str_replace( '@wordpress/', 'wp-', $package_name );
			}

			return $package_name;
		}, $deps );
	}

	private function get_packages_data() {
		if ( ! $this->packages_data ) {
			// Loading the file that is responsible for registering the packages in the filter.
			require_once ELEMENTOR_ASSETS_PATH . 'js/packages/loader.php';

			$packages_data = apply_filters( 'elementor/packages/config', [] );

			// Packages that there is no access to the package.json file.
			$type_exceptions = [
				'@elementor/ui' => static::PACKAGE_TYPE_UTIL,
			];

			$this->packages_data = Collection::make( $packages_data )
				->map_with_keys( function ( $data, $name ) use ( $packages_data, $type_exceptions ) {
					$type = $type_exceptions[ $name ] ?? $data['type'] ?? static::PACKAGE_TYPE_EXTENSION;

					return [
						$name => [
							'handle' => $data['handle'],
							'src' => $data['url'] . $data['entry'] . '{{MIN_SUFFIX}}.js',
							'deps' => $this->map_packages_to_handles( $packages_data, $data['deps'] ),
							'i18n' => $data['i18n'],
							'type' => $type,
						],
					];
				} );
		}

		return $this->packages_data;
	}
}
