<?php
namespace Elementor\Core\Editor\Loading_Strategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Editor_Base_Loading_Strategy implements Loading_Strategy_Interface {
	public function get_scripts() {
		return [
			[
				'handle' => 'elementor-editor-modules',
				'src' => '{{ASSETS_URL}}js/editor-modules{{SUFFIX}}.js',
				'deps' => [ 'elementor-common-modules' ],
			],
			[
				'handle' => 'elementor-editor-document',
				'src' => '{{ASSETS_URL}}js/editor-document{{SUFFIX}}.js',
				'deps' => [ 'elementor-common-modules' ],
			],
			// Hack for waypoint with editor mode.
			[
				'handle' => 'elementor-editor-document',
				'src' => '{{ASSETS_URL}}lib/waypoints/waypoints-for-editor.js',
				'deps' => [ 'jquery' ],
				'version' => '4.0.2',
			],
			[
				'handle' => 'perfect-scrollbar',
				'src' => '{{ASSETS_URL}}lib/perfect-scrollbar/js/perfect-scrollbar{{SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.4.0',
			],
			[
				'handle' => 'jquery-easing',
				'src' => '{{ASSETS_URL}}lib/jquery-easing/jquery-easing{{SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.3.2',
			],
			[
				'handle' => 'nprogress',
				'src' => '{{ASSETS_URL}}lib/nprogress/nprogress{{SUFFIX}}.js',
				'version' => '0.2.0',
			],
			[
				'handle' => 'tipsy',
				'src' => '{{ASSETS_URL}}lib/tipsy/tipsy{{SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.0.0',
			],
			[
				'handle' => 'jquery-elementor-select2',
				'src' => '{{ASSETS_URL}}lib/e-select2/js/e-select2.full{{SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '4.0.6-rc.1',
			],
			[
				'handle' => 'flatpickr',
				'src' => '{{ASSETS_URL}}lib/flatpickr/flatpickr{{SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.12.0',
			],
			[
				'handle' => 'ace',
				'src' => 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js',
				'version' => '1.2.5',
			],
			[
				'handle' => 'ace-language-tools',
				'src' => 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ext-language_tools.js',
				'deps' => [ 'ace' ],
				'version' => '1.2.5',
			],
			[
				'handle' => 'jquery-hover-intent',
				'src' => '{{ASSETS_URL}}lib/jquery-hover-intent/jquery-hover-intent{{SUFFIX}}.js',
				'version' => '1.0.0',
			],
			[
				'handle' => 'nouislider',
				'src' => '{{ASSETS_URL}}lib/nouislider/nouislider{{SUFFIX}}.js',
				'version' => '13.0.0',
			],
			[
				'handle' => 'pickr',
				'src' => '{{ASSETS_URL}}lib/pickr/pickr.min.js',
				'version' => '1.5.0',
			],
			[
				'handle' => 'elementor-editor',
				'src' => '{{ASSETS_URL}}js/editor{{SUFFIX}}.js',
				'deps' => [
					'elementor-common',
					'elementor-editor-modules',
					'elementor-editor-document',
					'wp-auth-check',
					'jquery-ui-sortable',
					'jquery-ui-resizable',
					'perfect-scrollbar',
					'nprogress',
					'tipsy',
					'imagesloaded',
					'heartbeat',
					'jquery-elementor-select2',
					'flatpickr',
					'ace',
					'ace-language-tools',
					'jquery-hover-intent',
					'nouislider',
					'pickr',
					'react',
					'react-dom',
				],
			],
		];
	}
}
