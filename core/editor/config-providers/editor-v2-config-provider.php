<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Config_Provider implements Config_Provider_Interface {
	public function get_scripts() {
		return array_merge(
			Editor_Common_Assets::get_scripts(),
			[
				[
					'handle' => 'elementor-packages-locations',
					'src' => '{{ASSETS_URL}}/js/packages/locations{{SUFFIX}}.js',
					'deps' => [ 'react' ],
				],
				[
					'handle' => 'elementor-packages-top-bar',
					'src' => '{{ASSETS_URL}}/js/packages/top-bar{{SUFFIX}}.js',
					'deps' => [ 'react', 'elementor-packages-editor' ],
				],
				[
					'handle' => 'elementor-packages-editor',
					'src' => '{{ASSETS_URL}}/js/packages/editor{{SUFFIX}}.js',
					'deps' => [ 'react', 'react-dom', 'elementor-packages-locations' ],
				],

				// Loader script
				[
					'handle' => 'elementor-editor-loader-v2',
					'src' => ELEMENTOR_URL . 'core/editor/assets/js/editor-loader-v2.js',
					'deps' => [
						'elementor-editor',
						'elementor-packages-editor',
					],
				],
			]
		);
	}

	public function get_scripts_for_enqueue() {
		return [
			'elementor-packages-top-bar',

			// Loader script - must be last.
			'elementor-editor-loader-v2',
		];
	}

	public function get_styles() {
		return array_merge(
			Editor_Common_Assets::get_styles(),
			[
				[
					'handle' => 'elementor-editor-v2-overrides',
					'src' => ELEMENTOR_URL . 'core/editor/assets/css/editor-v2-overrides.css',
					'deps' => [ 'elementor-editor' ],
				],
			]
		);
	}

	public function get_styles_for_enqueue() {
		return [
			'elementor-editor-v2-overrides',
			'elementor-editor',
		];
	}

	public function get_template_body_file_path() {
		return __DIR__ . '/../templates/editor-body-v2.view.php';
	}
}
