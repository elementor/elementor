<?php
namespace Elementor\PageSettings;

use Elementor\Controls_Manager;
use Elementor\Controls_Stack;
use Elementor\Group_Control_Background;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Page extends Controls_Stack {

	/**
	 * @var \WP_Post
	 */
	private $post;

	public function __construct( array $data = [] ) {
		$this->post = get_post( $data['id'] );

		if ( ! $this->post ) {
			$this->post = new \WP_Post( (object) [] );
		}

		parent::__construct( $data );
	}

	public function get_name() {
		return 'page-settings-' . $this->post->ID;
	}

	public function on_export( $element_data ) {
		if ( ! empty( $element_data['settings']['template'] ) && Manager::TEMPLATE_CANVAS !== $element_data['settings']['template'] ) {
			unset( $element_data['settings']['template'] );
		}

		return $element_data;
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_page_settings',
			[
				'label' => __( 'Page Settings', 'elementor' ),
				'tab' => Controls_Manager::TAB_SETTINGS,
			]
		);

		$this->add_control(
			'post_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => $this->post->post_title,
				'label_block' => true,
				'separator' => 'none',
			]
		);

		$page_title_selector = get_option( 'elementor_page_title_selector' );

		if ( empty( $page_title_selector ) ) {
			$page_title_selector = 'h1.entry-title';
		}

		$this->add_control(
			'hide_title',
			[
				'label' => __( 'Hide Title', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
				'description' => sprintf( __( 'Not working? You can set a different selector for the title in the <a href="%s" target="_blank">Settings page</a>.', 'elementor' ), Settings::get_url() ),
				'selectors' => [
					'{{WRAPPER}} ' . $page_title_selector => 'display: none',
				],
				'export' => '__return_true',
			]
		);

		if ( Manager::is_cpt_custom_templates_supported() ) {
			require_once ABSPATH . '/wp-admin/includes/template.php';

			$options = [
				'default' => __( 'Default', 'elementor' ),
			];

			$options += array_flip( get_page_templates( null, $this->post->post_type ) );

			$saved_template = get_post_meta( $this->post->ID, '_wp_page_template', true );

			if ( ! $saved_template ) {
				$saved_template = 'default';
			}

			$this->add_control(
				'template',
				[
					'label' => __( 'Template', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => $saved_template,
					'options' => $options,
					'export' => function( $value ) {
						return Manager::TEMPLATE_CANVAS === $value;
					},
				]
			);
		}

		$post_type_object = get_post_type_object( $this->post->post_type );

		$can_publish = current_user_can( $post_type_object->cap->publish_posts );

		if ( 'publish' === $this->post->post_status || 'private' === $this->post->post_status || $can_publish ) {
			$this->add_control(
				'post_status',
				[
					'label' => __( 'Status', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => $this->post->post_status,
					'options' => get_post_statuses(),
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
