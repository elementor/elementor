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
		parent::__construct();
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'wp_enqueue_scripts', function() {
			$this->enqueue_styles();
		} );

//		add_filter('update_post_metadata', function($check, $object_id, $meta_key, $meta_value, $prev_value) {
//			if ($meta_key === '_wp_page_template'){
//				var_dump('update_post_metadata');
//			}
//			return $check;
//		}, 10, 5);

//		new Design_Guidelines_Post();
	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'design-guidelines';
	}

	protected function get_widgets() {
		return [
			'GlobalSettings\Global_Settings',
		];
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
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		wp_localize_script( $handle, 'elementorDesignGuidelinesConfig', [
			'activeKitId' => $kit_id,
		] );
	}

	public function enqueue_styles() {
		wp_enqueue_style(
			'design-guidelines',
			$this->get_css_assets_url( 'modules/design-guidelines/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
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
