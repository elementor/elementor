<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_Common_Assets {
	public static function get_script_configs() {
		return [
			[
				'handle' => 'elementor-editor-modules',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-modules{{MIN_SUFFIX}}.js',
				'deps' => [ 'elementor-common-modules' ],
			],
			[
				'handle' => 'elementor-editor-document',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-document{{MIN_SUFFIX}}.js',
				'deps' => [ 'elementor-common-modules' ],
			],
			// Hack for waypoint with editor mode.
			[
				'handle' => 'elementor-waypoints',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/waypoints/waypoints-for-editor.js',
				'deps' => [ 'jquery' ],
				'version' => '4.0.2',
			],
			[
				'handle' => 'perfect-scrollbar',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/perfect-scrollbar/js/perfect-scrollbar{{MIN_SUFFIX}}.js',
				'version' => '1.4.0',
			],
			[
				'handle' => 'jquery-easing',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/jquery-easing/jquery-easing{{MIN_SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.3.2',
			],
			[
				'handle' => 'nprogress',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/nprogress/nprogress{{MIN_SUFFIX}}.js',
				'version' => '0.2.0',
			],
			[
				'handle' => 'tipsy',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/tipsy/tipsy{{MIN_SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.0.0',
			],
			[
				'handle' => 'jquery-elementor-select2',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/e-select2/js/e-select2.full{{MIN_SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '4.0.6-rc.1',
			],
			[
				'handle' => 'flatpickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/flatpickr/flatpickr{{MIN_SUFFIX}}.js',
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
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/jquery-hover-intent/jquery-hover-intent{{MIN_SUFFIX}}.js',
				'version' => '1.0.0',
			],
			[
				'handle' => 'nouislider',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/nouislider/nouislider{{MIN_SUFFIX}}.js',
				'version' => '13.0.0',
			],
			[
				'handle' => 'pickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/pickr/pickr.min.js',
				'version' => '1.5.0',
			],
			[
				'handle' => 'elementor-editor',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor{{MIN_SUFFIX}}.js',
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
				'i18n' => [
					'domain' => 'elementor',
				],
			],
		];
	}

	public static function get_style_configs() {
		return [
			[
				'handle' => 'font-awesome',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/font-awesome/css/font-awesome{{MIN_SUFFIX}}.css',
				'version' => '4.7.0',
			],
			[
				'handle' => 'elementor-select2',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/e-select2/css/e-select2{{MIN_SUFFIX}}.css',
				'version' => '4.0.6-rc.1',
			],
			[
				'handle' => 'google-font-roboto',
				'src' => 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
			],
			[
				'handle' => 'flatpickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/flatpickr/flatpickr{{MIN_SUFFIX}}.css',
				'version' => '1.12.0',
			],
			[
				'handle' => 'pickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/pickr/themes/monolith.min.css',
				'version' => '1.5.0',
			],
			[
				'handle' => 'elementor-editor',
				'src' => '{{ELEMENTOR_ASSETS_URL}}css/editor{{DIRECTION_SUFFIX}}{{MIN_SUFFIX}}.css',
				'deps' => [
					'elementor-common',
					'elementor-select2',
					'elementor-icons',
					'wp-auth-check',
					'google-font-roboto',
					'flatpickr',
					'pickr',
				],
			],
		];
	}
}
