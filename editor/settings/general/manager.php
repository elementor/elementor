<?php
namespace Elementor\Editor\Settings\General;

use Elementor\Controls_Manager;
use Elementor\CSS_File;
use Elementor\Editor\Settings\Base\Manager as BaseManager;
use Elementor\Editor\Settings\Base\Model as BaseModel;
use Elementor\Global_CSS_File;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager extends BaseManager {

	const PANEL_TAB_GENERAL_STYLE = 'general_style';

	public function __construct() {
		parent::__construct();

		$this->add_panel_tabs();
	}

	/**
	 * @return string
	 */
	public function get_name() {
		return 'general';
	}

	/**
	 * @return BaseModel
	 */
	public function get_model_for_config() {
		return $this->get_model();
	}

	/**
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
	 * @return string
	 */
	protected function get_css_file_name() {
		return 'global';
	}

	/**
	 * @param array $settings
	 * @param int   $id
	 *
	 * @return void
	 */
	protected function save_settings_to_db( array $settings, $id ) {
		$model_controls = Model::get_controls_list();

		foreach ( $model_controls as $tab_name => $sections ) {

			foreach ( $sections as $section_name => $section_data ) {

				foreach ( $section_data['controls'] as $control_name => $control_data ) {
					if ( isset( $settings[ $control_name ] ) ) {
						update_option( $control_name, $settings[ $control_name ] );
					} else {
						delete_option( $control_name );
					}
				}
			}
		}
	}

	/**
	 * @param CSS_File $css_file
	 *
	 * @return BaseModel
	 */
	protected function get_model_for_css_file( CSS_File $css_file ) {
		return $this->get_model();
	}

	/**
	 * @param int $id
	 *
	 * @return CSS_File
	 */
	protected function get_css_file_for_update( $id ) {
		return new Global_CSS_File();
	}

	private function add_panel_tabs() {
		Controls_Manager::add_tab( self::PANEL_TAB_GENERAL_STYLE, __( 'General Style', '' ) );
	}
}
