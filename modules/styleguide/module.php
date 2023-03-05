<?php
namespace Elementor\Modules\Styleguide;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	const ASSETS_HANDLE = 'styleguide';
	const EXPERIMENT_NAME = 'e_global_styleguide';

	/**
	 * Initialize the Container-Converter module.
	 *
	 * @return void
	 */
	public function __construct() {
		parent::__construct();
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor/preview/enqueue_styles', [ $this, 'enqueue_styles' ] );
	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'styleguide';
	}

	protected function get_widgets() {
		return [
			'GlobalSettings\Global_Settings',
		];
	}

	public static function get_experimental_data() {
		return [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Global style guide', 'elementor' ),
			'tag' => esc_html__( 'Feature', 'elementor' ), //todo : add tag
			'description' => esc_html__( 'Display a live preview of changes to global colors and fonts in a sleek style guide from the site’s settings. You will be able to toggle between the style guide and the page to see your changes in action.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
		];
	}

	/**
	 * Enqueue scripts.
	 *
	 * @return void
	 */
	public function enqueue_scripts() {
		wp_enqueue_script(
			$this::ASSETS_HANDLE,
			$this->get_js_assets_url( $this::ASSETS_HANDLE ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);

		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		wp_localize_script( $this::ASSETS_HANDLE, 'elementorStyleguideConfig', [
			'activeKitId' => $kit_id,
		] );
	}

	public function enqueue_styles() {
		wp_enqueue_style(
			$this::ASSETS_HANDLE,
			$this->get_css_assets_url( 'modules/styleguide/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	/**
	 * Check whether the user has Styleguide Preview enabled.
	 *
	 * @return bool
	 */
	public static function is_styleguide_preview_enabled(): bool {
		$editor_preferences = SettingsManager::get_settings_managers( 'editorPreferences' )->get_model();

		return $editor_preferences->get_settings( 'enable_styleguide_preview' );
	}
}
