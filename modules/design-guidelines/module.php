<?php

namespace Elementor\Modules\DesignGuidelines;

use Elementor\Core\Documents_Manager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Modules\DesignGuidelines\Components\Design_Guidelines_Post;
use Elementor\Modules\DesignGuidelines\documents\Design_Guidelines;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	/**
	 * Initialize the Container-Converter module.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'elementor/documents/register', [ $this, 'register_document' ] );
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'enqueue_styles' ] );


//		add_filter('update_post_metadata', function($check, $object_id, $meta_key, $meta_value, $prev_value) {
//			if ($meta_key === '_wp_page_template'){
//				var_dump('update_post_metadata');
//			}
//			return $check;
//		}, 10, 5);

//		new Design_Guidelines_Post();
	}

	public function get_script_url() {
		return $this->get_js_assets_url( 'design-guidelines' );
	}

	public function get_style_url() {
		return $this->get_css_assets_url( 'modules/design-guidelines/module' );
	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'design-guidelines';
	}

	/**
	 * Determine whether the module is active.
	 *
	 * @return bool
	 */
	public static function is_active() {
		return true;
		//		return Plugin::$instance->experiments->is_feature_active( 'container' );// TODO 06/02/2023 : Add check for design guidelines experiment.
	}

	public static function get_experimental_data() {
		return false; //todo
	}

	/**
	 * Enqueue scripts.
	 *
	 * @return void
	 */
	public function enqueue_scripts() {

		$handle = 'design-guidelines';

		wp_enqueue_script(
			$handle,
			$this->get_js_assets_url( 'design-guidelines' ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);

		// todo : should do this?
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$settings = $kit->get_settings();

		wp_localize_script( $handle, 'elementorDesignGuidelinesConfig', [
			//			'ajaxUrl' => admin_url( 'admin-ajax.php' ), todo
			//			'nonce' => wp_create_nonce( 'elementor_design_guidelines' ), todo
			'customColors' => $settings['custom_colors'],
			'systemColors' => $settings['system_colors'],
			'customFonts' => $settings['custom_typography'],
		] );
	}

	public function enqueue_styles() {
		wp_enqueue_style(
			'design-guidelines',
			$this->get_css_assets_url( 'modules/design-guidelines/editor' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	/**
	 * @param Documents_Manager $documents_manager
	 */
	public function register_document( $documents_manager ) {
		$documents_manager->register_document_type( Design_Guidelines::TYPE, Design_Guidelines::get_class_full_name() );
	}

	/**
	 * Check whether the user has Styleguide Preview enabled.
	 *
	 * @return bool
	 */
	public static function is_styleguide_preview_enabled() : bool {
		$editor_preferences = SettingsManager::get_settings_managers( 'editorPreferences' )->get_model();

		return $editor_preferences->get_settings( 'enable_style_guide_preview' );
	}
}
