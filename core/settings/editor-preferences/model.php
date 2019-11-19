<?php

namespace Elementor\Core\Settings\EditorPreferences;

use Elementor\Controls_Manager;
use Elementor\Core\Settings\Base\Model as BaseModel;

if( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Model extends BaseModel {

	/**
	 * Get element name.
	 *
	 * Retrieve the element name.
	 *
	 * @return string The name.
	 * @since 2.8.0
	 * @access public
	 *
	 */
	public function get_name() {
	 	return 'editor-preferences';
	}

	/**
	 * Get CSS wrapper selector.
	 *
	 * Retrieve the wrapper selector for the current panel.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	public function get_css_wrapper_selector() {
		// TODO: Implement get_css_wrapper_selector() method.
	}

	/**
	 * Get panel page settings.
	 *
	 * Retrieve the page setting for the current panel.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	public function get_panel_page_settings() {
		return [
			'title' => __( 'Editor Preferences', 'elementor' ),
		];
	}

	/**
	 * @since 2.8.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section( 'preferences', [
			'tab' => Controls_Manager::TAB_SETTINGS,
			'label' => __( 'Preferences', 'elementor' ),
		]);

		$this->add_control(
			'ui_theme',
			[
				'label' => __( 'Theme', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'description' => __( 'Choose whether to use the editor theme in Light, Dark or Auto according to system preferences.', 'elementor' ),
				'default' => 'auto',
				'options' => [
					'auto' => __( 'Auto Detect', 'elementor' ),
					'light' => __( 'Light', 'elementor' ),
					'dark' => __( 'Dark', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'edit_buttons',
			[
				'label' => __( 'Editing Handles', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'description' => __( 'Show editing handles when hovering over the element edit button.', 'elementor' ),
			]
		);

		$this->add_control(
			'lightbox_in_editor',
			[
				'label' => __( 'Enable Lightbox In Editor', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
			]
		);

		$this->end_controls_section();
	}
}
