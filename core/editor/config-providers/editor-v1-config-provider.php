<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V1_Config_Provider implements Config_Provider_Interface {
	public function get_script_configs() {
		return array_merge(
			Editor_Common_Configs::get_script_configs(),
			[
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
}
