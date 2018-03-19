<?php
namespace Elementor\Core\Settings\General;

use Elementor\Controls_Manager;
use Elementor\CSS_File;
use Elementor\Core\Settings\Base\Manager as BaseManager;
use Elementor\Core\Settings\Base\Model as BaseModel;
use Elementor\Global_CSS_File;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor general settings manager class.
 *
 * Elementor general settings manager handler class is responsible for registering
 * and managing Elementor general settings managers.
 *
 * @since 1.6.0
 */
class Manager extends BaseManager {

	/**
	 * Lightbox panel tab.
	 */
	const PANEL_TAB_LIGHTBOX = 'lightbox';

	/**
	 * Meta key for the general settings.
	 */
	const META_KEY = '_elementor_general_settings';

	/**
	 * General settings manager constructor.
	 *
	 * Initializing Elementor general settings manager.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		parent::__construct();

		$this->add_panel_tabs();
	}

	/**
	 * Get manager name.
	 *
	 * Retrieve general settings manager name.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return string Manager name.
	 */
	public function get_name() {
		return 'general';
	}

	/**
	 * Get model for config.
	 *
	 * Retrieve the model for settings configuration.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return BaseModel The model object.
	 */
	public function get_model_for_config() {
		return $this->get_model();
	}

	/**
	 * Get saved settings.
	 *
	 * Retrieve the saved settings from the site options.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param int $id Post ID.
	 *
	 * @return array Saved settings.
	 */
	protected function get_saved_settings( $id ) {
		$model_controls = Model::get_controls_list();

		$settings = [];

		foreach ( $model_controls as $tab_name => $sections ) {

			foreach ( $sections as $section_name => $section_data ) {

				foreach ( $section_data['controls'] as $control_name => $control_data ) {
					$saved_setting = get_option( $control_name, null );

					if ( null !== $saved_setting ) {
						$settings[ $control_name ] = get_option( $control_name );
					}
				}
			}
		}

		return $settings;
	}

	/**
	 * Get CSS file name.
	 *
	 * Retrieve CSS file name for the general settings manager.
	 *
	 * @since 1.6.0
	 * @access protected
	 * @return string
	 *
	 * @return string CSS file name.
	 */
	protected function get_css_file_name() {
		return 'global';
	}

	/**
	 * Save settings to DB.
	 *
	 * Save general settings to the database, as site options.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param array $settings Settings.
	 * @param int   $id       Post ID.
	 */
	protected function save_settings_to_db( array $settings, $id ) {
		$model_controls = Model::get_controls_list();

		$one_list_settings = [];

		foreach ( $model_controls as $tab_name => $sections ) {

			foreach ( $sections as $section_name => $section_data ) {

				foreach ( $section_data['controls'] as $control_name => $control_data ) {
					if ( isset( $settings[ $control_name ] ) ) {
						$one_list_control_name = str_replace( 'elementor_', '', $control_name );

						$one_list_settings[ $one_list_control_name ] = $settings[ $control_name ];

						update_option( $control_name, $settings[ $control_name ] );
					} else {
						delete_option( $control_name );
					}
				}
			}
		}

		// Save all settings in one list for a future usage
		if ( ! empty( $one_list_settings ) ) {
			update_option( self::META_KEY, $one_list_settings );
		} else {
			delete_option( self::META_KEY );
		}
	}

	/**
	 * Get model for CSS file.
	 *
	 * Retrieve the model for the CSS file.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param CSS_File $css_file The requested CSS file.
	 *
	 * @return BaseModel The model object.
	 */
	protected function get_model_for_css_file( CSS_File $css_file ) {
		return $this->get_model();
	}

	/**
	 * Get CSS file for update.
	 *
	 * Retrieve the CSS file before updating the it.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param int $id Post ID.
	 *
	 * @return Global_CSS_File The global CSS file object.
	 */
	protected function get_css_file_for_update( $id ) {
		return new Global_CSS_File();
	}

	/**
	 * Add panel tabs.
	 *
	 * Register new panel tab for the lightbox settings.
	 *
	 * @since 1.6.0
	 * @access private
	 */
	private function add_panel_tabs() {
		Controls_Manager::add_tab( self::PANEL_TAB_LIGHTBOX, __( 'Lightbox', 'elementor' ) );
	}
}
