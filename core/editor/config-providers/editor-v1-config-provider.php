<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V1_Config_Provider implements Config_Provider_Interface {
	public function get_script_configs() {
		$ui_package = $this->get_package_config( 'ui' );
		$icons_package = $this->get_package_config( 'icons' );

		return array_merge(
			Editor_Common_Configs::get_script_configs(),
			[
				$ui_package,
				$icons_package,
				[
					'handle' => 'elementor-responsive-bar',
					'src' => '{{ELEMENTOR_ASSETS_URL}}js/responsive-bar{{MIN_SUFFIX}}.js',
					'deps' => [ 'elementor-editor' ],
					'i18n' => [
						'domain' => 'elementor',
					],
				],
				// Loader script
				[
					'handle' => 'elementor-editor-loader-v1',
					'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-loader-v1{{MIN_SUFFIX}}.js',
					'deps' => [ 'elementor-editor' ],
				],
			]
		);
	}

	public function get_script_handles_to_enqueue() {
		return [
			'elementor-responsive-bar',

			// Must be last.
			'elementor-editor-loader-v1',
		];
	}

	public function get_client_settings() {
		return Editor_Common_Configs::get_client_settings();
	}

	public function get_style_configs() {
		return array_merge(
			Editor_Common_Configs::get_style_configs(),
			[
				[
					'handle' => 'elementor-responsive-bar',
					'src' => '{{ELEMENTOR_ASSETS_URL}}css/responsive-bar{{MIN_SUFFIX}}.css',
				],
			]
		);
	}

	public function get_style_handles_to_enqueue() {
		return [
			'elementor-editor',
			'elementor-responsive-bar',
		];
	}

	public function get_template_body_file_path() {
		return __DIR__ . '/../templates/editor-body-v1.view.php';
	}

	public function get_additional_template_paths() {
		return array_merge(
			Editor_Common_Configs::get_additional_template_paths(),
			[ ELEMENTOR_PATH . 'includes/editor-templates/responsive-bar.php' ]
		);
	}

	private function get_package_config( $package_name ) {
		$asset_file = ELEMENTOR_ASSETS_PATH . "js/packages/$package_name.asset.php";

		if ( ! file_exists( $asset_file ) ) {
			return [];
		}

		$data = require $asset_file;

		return [
			'handle' => $data['handle'],
			'src' => $data['src'],
			'deps' => $data['deps'],
		];
	}
}
