<?php
namespace Elementor\Core\Editor\Loader\V1;

use Elementor\Core\Editor\Loader\Editor_Base_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V1_Loader extends Editor_Base_Loader {
	/**
	 * @return void
	 */
	public function register_scripts() {
		parent::register_scripts();

		$packages_names = [ 'ui', 'icons' ];

		foreach ( $packages_names as $package_name ) {
			$config = $this->assets_config_provider->get( $package_name );

			if ( ! $config ) {
				return;
			}

			wp_register_script(
				$config['handle'],
				$this->placeholder_replacer->replace( "{{BASE_URL}}js/packages/{$package_name}{{MIN_SUFFIX}}.js" ),
				$config['deps'],
				ELEMENTOR_VERSION,
				true
			);
		}

		wp_register_script(
			'elementor-responsive-bar',
			$this->placeholder_replacer->replace( '{{BASE_URL}}js/responsive-bar{{MIN_SUFFIX}}.js' ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'elementor-editor-loader-v1',
			$this->placeholder_replacer->replace( '{{BASE_URL}}js/editor-loader-v1{{MIN_SUFFIX}}.js' ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	/**
	 * @return void
	 */
	public function enqueue_scripts() {
		parent::enqueue_scripts();

		wp_enqueue_script( 'elementor-responsive-bar' );

		// Must be last.
		wp_enqueue_script( 'elementor-editor-loader-v1' );
	}

	/**
	 * @return void
	 */
	public function load_scripts_translations() {
		parent::load_scripts_translations();

		wp_set_script_translations( 'elementor-responsive-bar', 'elementor' );
	}

	/**
	 * @return void
	 */
	public function register_styles() {
		parent::register_styles();

		wp_register_style(
			'elementor-responsive-bar',
			$this->placeholder_replacer->replace( '{{BASE_URL}}css/responsive-bar{{MIN_SUFFIX}}.css' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_styles() {
		parent::enqueue_styles();

		wp_enqueue_style( 'elementor-responsive-bar' );
	}

	/**
	 * @return void
	 */
	public function print_root_template() {
		// Exposing the path for the view part to render the body of the editor template.
		$body_file_path = __DIR__ . '/templates/editor-body-v1.view.php';

		include ELEMENTOR_PATH . 'includes/editor-templates/editor-wrapper.php';
	}

	/**
	 * @return void
	 */
	public function register_additional_templates() {
		parent::register_additional_templates();

		Plugin::$instance->common->add_template( ELEMENTOR_PATH . 'includes/editor-templates/responsive-bar.php' );
	}
}
