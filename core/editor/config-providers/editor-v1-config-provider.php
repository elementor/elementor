<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V1_Config_Provider implements Config_Provider_Interface {
	public function get_script_configs() {
		return array_merge(
			Editor_Common_Assets::get_script_configs(),
			[
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
		return [ 'elementor-editor-loader-v1' ];
	}

	public function get_style_configs() {
		return Editor_Common_Assets::get_style_configs();
	}

	public function get_style_handles_to_enqueue() {
		return [ 'elementor-editor' ];
	}

	public function get_template_body_file_path() {
		return __DIR__ . '/../templates/editor-body-v1.view.php';
	}
}
