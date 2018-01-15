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

class Manager extends BaseManager {

	const PANEL_TAB_LIGHTBOX = 'lightbox';

	const META_KEY = '_elementor_general_settings';

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		parent::__construct();

		$this->add_panel_tabs();
	}

	/**
	 * @since 1.6.0
	 * @access public
	 * @return string
	 */
	public function get_name() {
		return 'general';
	}

	/**
	 * @since 1.6.0
	 * @access public
	 * @return BaseModel
	 */
	public function get_model_for_config() {
		return $this->get_model();
	}

	/**
	 * @since 1.6.0
	 * @access protected
	 * @param int $id
	 *
	 * @return array
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
	 * @since 1.6.0
	 * @access protected
	 * @return string
	 */
	protected function get_css_file_name() {
		return 'global';
	}

	/**
	 * @since 1.6.0
	 * @access protected
	 * @param array $settings
	 * @param int   $id
	 *
	 * @return void
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

		// Save all settings in one list for future usage
		if ( ! empty( $one_list_settings ) ) {
			update_option( self::META_KEY, $one_list_settings );
		} else {
			delete_option( self::META_KEY );
		}
	}

	/**
	 * @since 1.6.0
	 * @access protected
	 * @param CSS_File $css_file
	 *
	 * @return BaseModel
	 */
	protected function get_model_for_css_file( CSS_File $css_file ) {
		return $this->get_model();
	}

	/**
	 * @since 1.6.0
	 * @access protected
	 * @param int $id
	 *
	 * @return CSS_File
	 */
	protected function get_css_file_for_update( $id ) {
		return new Global_CSS_File();
	}

	/**
	 * @since 1.6.0
	 * @access private
	 */
	private function add_panel_tabs() {
		Controls_Manager::add_tab( self::PANEL_TAB_LIGHTBOX, __( 'Lightbox', 'elementor' ) );
	}
}
