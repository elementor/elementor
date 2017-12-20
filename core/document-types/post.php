<?php
namespace Elementor\Core\DocumentTypes;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;
use Elementor\Core\Settings\Page\Manager;
use Elementor\Settings;
use Elementor\Core\Settings\Manager as SettingsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Post extends Document {

	public function get_name() {
		return 'post';
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

		if ( Manager::is_cpt_custom_templates_supported() ) {
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
					'export' => function( $value ) {
						return Manager::TEMPLATE_CANVAS === $value;
					},
				]
			);
		}

		$this->end_controls_section();
	}

	public function get_css_wrapper_selector() {
		return 'body.elementor-page-' . $this->get_id();
	}
}
