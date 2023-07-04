<?php
namespace Elementor\Core\Editor\Loader;

use Elementor\Core\Editor\Loader\Common\Editor_Common_Scripts_Settings;
use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Core\Utils\Placeholder_Replacer;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Editor_Base_Loader implements Editor_Loader_Interface {
	/**
	 * @var Placeholder_Replacer
	 */
	protected $placeholder_replacer;

	/**
	 * @var Assets_Config_Provider
	 */
	protected $assets_config_provider;

	/**
	 * @param Placeholder_Replacer $placeholder_replacer
	 * @param Assets_Config_Provider $assets_config_provider
	 */
	public function __construct(
		Placeholder_Replacer $placeholder_replacer,
		Assets_Config_Provider $assets_config_provider
	) {
		$this->placeholder_replacer = $placeholder_replacer;
		$this->assets_config_provider = $assets_config_provider;
	}

	public function init() {
		// Nothing to do.
	}

	/**
	 * @return void
	 */
	public function register_scripts() {
		wp_register_script(
			'elementor-editor-modules',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}js/editor-modules{{MIN_SUFFIX}}.js' ),
			[ 'elementor-common-modules' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'elementor-editor-document',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}js/editor-document{{MIN_SUFFIX}}.js' ),
			[ 'elementor-common-modules' ],
			ELEMENTOR_VERSION,
			true
		);

		// Hack for waypoint with editor mode.
		wp_register_script(
			'elementor-waypoints',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/waypoints/waypoints-for-editor.js' ),
			[ 'jquery' ],
			'4.0.2',
			true
		);

		wp_register_script(
			'perfect-scrollbar',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/perfect-scrollbar/js/perfect-scrollbar{{MIN_SUFFIX}}.js' ),
			[],
			'1.4.0',
			true
		);

		wp_register_script(
			'jquery-easing',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/jquery-easing/jquery-easing{{MIN_SUFFIX}}.js' ),
			[ 'jquery' ],
			'1.3.2',
			true
		);

		wp_register_script(
			'nprogress',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/nprogress/nprogress{{MIN_SUFFIX}}.js' ),
			[],
			'0.2.0',
			true
		);

		wp_register_script(
			'tipsy',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/tipsy/tipsy{{MIN_SUFFIX}}.js' ),
			[ 'jquery' ],
			'1.0.0',
			true
		);

		wp_register_script(
			'jquery-elementor-select2',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/e-select2/js/e-select2.full{{MIN_SUFFIX}}.js' ),
			[ 'jquery' ],
			'4.0.6-rc.1',
			true
		);

		wp_register_script(
			'flatpickr',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/flatpickr/flatpickr{{MIN_SUFFIX}}.js' ),
			[ 'jquery' ],
			'1.12.0',
			true
		);

		wp_register_script(
			'ace',
			'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js',
			[],
			'1.2.5',
			true
		);

		wp_register_script(
			'ace-language-tools',
			'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ext-language_tools.js',
			[ 'ace' ],
			'1.2.5',
			true
		);

		wp_register_script(
			'jquery-hover-intent',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/jquery-hover-intent/jquery-hover-intent{{MIN_SUFFIX}}.js' ),
			[],
			'1.0.0',
			true
		);

		wp_register_script(
			'nouislider',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/nouislider/nouislider{{MIN_SUFFIX}}.js' ),
			[],
			'13.0.0',
			true
		);

		wp_register_script(
			'pickr',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/pickr/pickr.min.js' ),
			[],
			'1.5.0',
			true
		);

		wp_register_script(
			'elementor-editor',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}js/editor{{MIN_SUFFIX}}.js' ),
			[
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
			ELEMENTOR_VERSION,
			true
		);
	}

	public function enqueue_scripts() {
		//
	}

	public function load_scripts_translations() {
		wp_set_script_translations( 'elementor-editor', 'elementor' );
	}

	/**
	 * @return void
	 */
	public function print_scripts_settings() {
		Utils::print_js_config(
			'elementor-editor',
			'ElementorConfig',
			Editor_Common_Scripts_Settings::get()
		);
	}

	/**
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'font-awesome',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/font-awesome/css/font-awesome{{MIN_SUFFIX}}.css' ),
			[],
			'4.7.0'
		);

		wp_register_style(
			'elementor-select2',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/e-select2/css/e-select2{{MIN_SUFFIX}}.css' ),
			[],
			'4.0.6-rc.1'
		);

		wp_register_style(
			'google-font-roboto',
			'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
			[],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'flatpickr',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/flatpickr/flatpickr{{MIN_SUFFIX}}.css' ),
			[],
			'1.12.0'
		);

		wp_register_style(
			'pickr',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}lib/pickr/themes/monolith.min.css' ),
			[],
			'1.5.0'
		);

		wp_register_style(
			'elementor-editor',
			$this->placeholder_replacer->replace( '{{ASSETS_URL}}css/editor{{DIRECTION_SUFFIX}}{{MIN_SUFFIX}}.css' ),
			[
				'elementor-common',
				'elementor-select2',
				'elementor-icons',
				'wp-auth-check',
				'google-font-roboto',
				'flatpickr',
				'pickr',
			],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_styles() {
		wp_enqueue_style( 'elementor-editor' );
	}

	/**
	 * @return void
	 */
	public function register_additional_templates() {
		$templates = [
			'global',
			'panel',
			'panel-elements',
			'repeater',
			'templates',
			'navigator',
			'hotkeys',
		];

		foreach ( $templates as $template ) {
			Plugin::$instance->common->add_template( ELEMENTOR_PATH . "includes/editor-templates/{$template}.php" );
		}
	}
}
