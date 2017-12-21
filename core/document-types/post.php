<?php
namespace Elementor\Core\DocumentTypes;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;
use Elementor\Group_Control_Background;
use Elementor\Settings;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Post extends Document {

	public function get_name() {
		return 'post';
	}

	public function get_css_wrapper_selector() {
		return 'body.elementor-page-' . $this->get_id();
	}

	public function save( $data ) {
		if ( ! parent::save( $data ) ) {
			return false;
		}

		if ( Utils::is_cpt_custom_templates_supported() ) {
			$template = 'default';

			if ( isset( $data['settings']['template'] ) ) {
				$template = $data['settings']['template'];
			}

			update_post_meta( $this->post->ID, '_wp_page_template', $template );
		}

		return true;
	}

	protected function _register_controls() {
		parent::_register_controls();

		$this->start_controls_section(
			'section_page_settings',
			[
				'label' => __( 'Page Settings', 'elementor' ),
				'tab' => Controls_Manager::TAB_SETTINGS,
			]
		);

		$page_title_selector = SettingsManager::get_settings_managers( 'general' )->get_model()->get_settings( 'elementor_page_title_selector' );

		if ( ! $page_title_selector ) {
			$page_title_selector = 'h1.entry-title';
		}

		$this->add_control(
			'hide_title',
			[
				'label' => __( 'Hide Title', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
				// translators: %s: Setting Page link
				'description' => sprintf( __( 'Not working? You can set a different selector for the title in the <a href="%s" target="_blank">Settings page</a>.', 'elementor' ), Settings::get_url() ),
				'selectors' => [
					'{{WRAPPER}} ' . $page_title_selector => 'display: none',
				],
				'export' => '__return_true',
			]
		);

		if ( post_type_supports( $this->post->post_type, 'excerpt' ) ) {
			$this->add_control(
				'post_excerpt',
				[
					'label' => __( 'Excerpt', 'elementor' ),
					'type' => Controls_Manager::TEXTAREA,
					'default' => $this->post->post_excerpt,
					'label_block' => true,
				]
			);
		}

		if ( Utils::is_cpt_custom_templates_supported() ) {
			require_once ABSPATH . '/wp-admin/includes/template.php';

			$options = [
				'default' => __( 'Default', 'elementor' ),
			];

			$options += array_flip( get_page_templates( null, $this->post->post_type ) );

			$this->add_control(
				'template',
				[
					'label' => __( 'Template', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => 'default',
					'options' => $options,
				]
			);
		}

		$this->end_controls_section();

		$this->start_controls_section(
			'section_page_style',
			[
				'label' => __( 'Page Style', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background',
				'label' => __( 'Background', 'elementor' ),
				'fields_options' => [
					'__all' => [
						'export' => '__return_true',
					],
				],
			]
		);

		$this->add_responsive_control(
			'padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'selectors' => [
					'{{WRAPPER}}' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
				],
				'export' => '__return_true',
			]
		);

		$this->end_controls_section();
	}
}
