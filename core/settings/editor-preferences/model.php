<?php

namespace Elementor\Core\Settings\EditorPreferences;

use Elementor\Controls_Manager;
use Elementor\Core\Settings\Base\Model as BaseModel;
use Elementor\Modules\EditorAppBar\Module as AppBarModule;
use Elementor\Modules\Checklist\Module as ChecklistModule;
use Elementor\Plugin;

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
			'editor_heading',
			[
				'label' => esc_html__( 'Panel', 'elementor' ),
				'type' => Controls_Manager::HEADING,
			]
		);

		$this->add_control(
			'ui_theme',
			[
				'label' => esc_html__( 'Display mode', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'light' => [
						'title' => esc_html__( 'Light mode', 'elementor' ),
						'icon' => 'eicon-light-mode',
					],
					'dark' => [
						'title' => esc_html__( 'Dark mode', 'elementor' ),
						'icon' => 'eicon-dark-mode',
					],
					'auto' => [
						'title' => esc_html__( 'Auto detect', 'elementor' ),
						'icon' => 'eicon-header',
					],
				],
				'default' => 'auto',
				'description' => esc_html__( 'Set light or dark mode, or auto-detect to sync with your operating system settings.', 'elementor' ),
			]
		);

		$this->add_control(
			'panel_width',
			[
				'label' => esc_html__( 'Width', 'elementor' ) . ' (px)',
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
			'preview_heading',
			[
				'label' => esc_html__( 'Canvas', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		if ( ! Plugin::$instance->experiments->is_feature_active( AppBarModule::EXPERIMENT_NAME ) ) {

			$this->add_control(
				'default_device_view',
				[
					'label' => esc_html__( 'Default device view', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => 'default',
					'options' => [
						'default' => esc_html__( 'Default', 'elementor' ),
						'mobile' => esc_html__( 'Mobile', 'elementor' ),
						'tablet' => esc_html__( 'Tablet', 'elementor' ),
						'desktop' => esc_html__( 'Desktop', 'elementor' ),
					],
					'description' => esc_html__( 'Choose which device to display when clicking the Responsive Mode icon.', 'elementor' ),
				]
			);

		}

		$this->add_control(
			'edit_buttons',
			[
				'label' => esc_html__( 'Show quick edit options', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'description' => esc_html__( 'Show additional actions while hovering over the handle of an element.', 'elementor' ),
			]
		);

		$this->add_control(
			'lightbox_in_editor',
			[
				'label' => esc_html__( 'Expand images in lightbox', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'description' => esc_html__( 'This only applies while you’re working in the editor. The front end won’t be affected.', 'elementor' ),
			]
		);

		$this->add_control(
			'show_hidden_elements',
			[
				'label' => esc_html__( 'Show hidden elements', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'default' => 'yes',
				'description' => esc_html__( 'This refers to elements you’ve hidden in the Responsive Visibility settings.', 'elementor' ),
			]
		);

		if ( ChecklistModule::should_display_checklist_toggle_control() ) {
			$this->add_control(
				'get_started_heading',
				[
					'label' => esc_html__( 'Get Started', 'elementor' ),
					'type' => Controls_Manager::HEADING,
					'separator' => 'before',
				]
			);

			$this->add_control(
				ChecklistModule::VISIBILITY_SWITCH_ID,
				[
					'label' => esc_html__( 'Launchpad Checklist', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'label_on' => esc_html__( 'Show', 'elementor' ),
					'label_off' => esc_html__( 'Hide', 'elementor' ),
					'default' => Plugin::$instance->modules_manager->get_modules( 'checklist' )->is_preference_switch_on() ? 'yes' : '',
					'description' => esc_html__( 'Show a checklist to guide you through your first steps of website creation.', 'elementor' ),
				]
			);
		}

		$this->add_control(
			'design_system_heading',
			[
				'label' => esc_html__( 'Design System', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'enable_styleguide_preview',
			[
				'label' => esc_html__( 'Show global settings', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'description' => esc_html__( 'Temporarily overlay the canvas with the style guide to preview your changes to global colors and fonts.', 'elementor' ),
			]
		);

		$this->add_control(
			'navigation_heading',
			[
				'label' => esc_html__( 'Navigation', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'exit_to',
			[
				'label' => esc_html__( 'Exit to', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'this_post',
				'options' => [
					'this_post' => esc_html__( 'This Post', 'elementor' ),
					'all_posts' => esc_html__( 'All Posts', 'elementor' ),
					'dashboard' => esc_html__( 'WP Dashboard', 'elementor' ),
				],
				'description' => esc_html__( 'Decide where you want to go when leaving the editor.', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}
}
