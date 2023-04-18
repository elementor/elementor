<?php

namespace Elementor\Core\Settings\EditorPreferences;

use Elementor\Controls_Manager;
use Elementor\Core\Settings\Base\Model as BaseModel;

if ( ! defined( 'ABSPATH' ) ) {
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
	 * Get panel page settings.
	 *
	 * Retrieve the page setting for the current panel.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	public function get_panel_page_settings() {
		return [
			'title' => esc_html__( 'User Preferences', 'elementor' ),
		];
	}

	/**
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'preferences',
			[
				'tab' => Controls_Manager::TAB_SETTINGS,
				'label' => esc_html__( 'Preferences', 'elementor' ),
			]
		);

		$this->add_control(
			'ui_theme',
			[
				'label' => esc_html__( 'UI Theme', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'description' => esc_html__( 'Set light or dark mode, or use Auto Detect to sync it with your OS setting.', 'elementor' ),
				'default' => 'auto',
				'options' => [
					'auto' => esc_html__( 'Auto Detect', 'elementor' ),
					'light' => esc_html__( 'Light', 'elementor' ),
					'dark' => esc_html__( 'Dark', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'panel_width',
			[
				'label' => esc_html__( 'Panel Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 200,
						'max' => 680,
					],
				],
				'default' => [
					'size' => 300,
				],
			]
		);

		$this->add_control(
			'edit_buttons',
			[
				'label' => esc_html__( 'Editing Handles', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'description' => esc_html__( 'Show editing handles when hovering over the element edit button.', 'elementor' ),
			]
		);

		$this->add_control(
			'lightbox_in_editor',
			[
				'label' => esc_html__( 'Enable Lightbox In Editor', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
			]
		);

		$this->add_control(
			'responsive_heading',
			[
				'label' => esc_html__( 'Responsive Preview', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'show_hidden_elements',
			[
				'label' => esc_html__( 'Hidden Elements', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Show', 'elementor' ),
				'label_off' => esc_html__( 'Hide', 'elementor' ),
				'default' => 'yes',
			]
		);

		$this->add_control(
			'default_device_view',
			[
				'label' => esc_html__( 'Default Device View ', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'mobile' => esc_html__( 'Mobile', 'elementor' ),
					'tablet' => esc_html__( 'Tablet', 'elementor' ),
					'desktop' => esc_html__( 'Desktop', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'exit_to',
			[
				'label' => esc_html__( 'Exit to', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'separator' => 'before',
				'description' => esc_html__( 'Decide where you want to go when you click the "Exit" button.', 'elementor' ),
				'default' => 'this_post',
				'options' => [
					'this_post' => esc_html__( 'This Post', 'elementor' ),
					'all_posts' => esc_html__( 'All Posts', 'elementor' ),
					'dashboard' => esc_html__( 'WP Dashboard', 'elementor' ),
				],
			]
		);

		$this->end_controls_section();
	}
}
