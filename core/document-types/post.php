<?php
namespace Elementor\Core\DocumentTypes;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;
use Elementor\Core\Settings\Page\Manager;
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
		return 'body.elementor-page-' . $this->get_main_id();
	}

	protected function _register_controls() {
		parent::_register_controls();

		$page_title_selector = SettingsManager::get_settings_managers( 'general' )->get_model()->get_settings( 'elementor_page_title_selector' );

		if ( ! $page_title_selector ) {
			$page_title_selector = 'h1.entry-title';
		}

		$this->start_injection( [
			'of' => 'post_status',
		] );

		$this->add_control(
			'hide_title',
			[
				'label' => __( 'Hide Title', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
				// translators: %s: Setting Page link
				'description' => sprintf( __( 'Not working? You can set a different selector for the title in the <a href="%s" target="_blank">Settings page</a>.', 'elementor' ), Settings::get_url() . '#tab-style' ),
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

		if ( current_theme_supports( 'post-thumbnails' ) ) {
			$this->add_control(
				'post_featured_image',
				[
					'label' => __( 'Featured Image', 'elementor' ),
					'type' => Controls_Manager::MEDIA,
					'default' => [
						'url' => get_the_post_thumbnail_url( $this->post->ID ),
					]
				]
			);
		}

		if ( Utils::is_cpt_custom_templates_supported() ) {
			require_once ABSPATH . '/wp-admin/includes/template.php';

			$options = [
				'default' => __( 'Default', 'elementor' ),
			];

			$options += array_flip( get_page_templates( null, $this->get_main_post()->post_type ) );

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

		$this->end_injection();

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

	public function __construct( array $data = [] ) {
		$template = get_post_meta( $data['post_id'], '_wp_page_template', true );
		if ( empty( $template ) ) {
			$template = 'default';
		}
		$data['settings']['template'] = $template;

		parent::__construct( $data );
	}
}
