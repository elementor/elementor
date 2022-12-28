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
					'deps' => [ 'react', 'elementor-packages-editor', 'elementor-packages-ui' ],
				],
				[
					'handle' => 'elementor-packages-editor',
					'src' => '{{ASSETS_URL}}/js/packages/editor{{SUFFIX}}.js',
					'deps' => [ 'react', 'react-dom', 'elementor-packages-locations', 'elementor-packages-ui' ],
				],
				[
					'handle' => 'elementor-packages-ui',
					'src' => '{{ASSETS_URL}}/js/packages/ui{{SUFFIX}}.js',
					'deps' => [ 'react', 'react-dom' ],
				],
			]
		);
	}

	public function get_loader_scripts() {
		$deps = [
			// Feature packages.
			'elementor-packages-top-bar',

			// Apps.
			'elementor-editor',
			'elementor-packages-editor',
		];

		// TODO: Maybe load feature packages and then there is no need for this filter.
		$deps = array_filter( $deps, function ( $handle ) {
			return wp_script_is( $handle, 'registered' );
		} );

		return [
			[
				'handle' => 'elementor-editor-loader-v2',
				'src' => ELEMENTOR_URL . 'core/editor/assets/js/editor-loader-v2.js',
				'deps' => $deps,
			],
		];
	}

	public function get_template_body_file_path() {
		return __DIR__ . '/../templates/editor-body-v2.view.php';
	}
}
